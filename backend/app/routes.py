from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from .models import db, Company, Trade
from .data_structures import AVLTree, Graph, Queue, Stack

main_bp = Blueprint('main', __name__)

def calculate_eco_score(company_obj):
    if company_obj.credits_allocated == 0: return 0
    ratio = company_obj.emissions / company_obj.credits_allocated
    if ratio < 0.5: return 95
    if ratio < 0.8: return 80
    if ratio < 1.0: return 65
    return 40

@main_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    company_id = data.get('company_id')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    industry = data.get('industry', 'Other')
    if Company.query.get(company_id): return jsonify({"msg": "Exists"}), 400
    new_company = Company(id=company_id, name=name, email=email, industry=industry, emissions=0.0, credits_allocated=0.0, credits_balance=0.0)
    new_company.set_password(password)
    db.session.add(new_company)
    db.session.commit()
    return jsonify({"msg": "Success"}), 201

@main_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    company_id = data.get('company_id')
    password = data.get('password')
    if company_id == 'admin' and password == 'password':
        return jsonify(access_token=create_access_token(identity='admin'), role='admin')
    comp = Company.query.get(company_id)
    if comp and comp.check_password(password):
        return jsonify(access_token=create_access_token(identity=comp.id), role='company', company=comp.to_dict())
    return jsonify({"msg": "Bad credentials"}), 401

@main_bp.route('/companies', methods=['GET', 'POST'])
def handle_companies():
    if request.method == 'POST':
        verify_jwt_in_request()
        if get_jwt_identity() != 'admin': return jsonify({'error': 'Admin only'}), 403
        data = request.json
        comp_id = data.get('company_id')
        comp = Company.query.get(comp_id)
        if not comp:
            comp = Company(id=comp_id, name=data.get('name'), email=data.get('email', f"{comp_id}@example.com"), industry=data.get('industry', 'Other'))
            db.session.add(comp)
        comp.emissions = float(data.get('emissions', 0))
        comp.credits_allocated = float(data.get('credits_allocated', 0))
        comp.credits_balance = comp.credits_allocated - comp.emissions
        if data.get('password'): comp.set_password(data.get('password'))
        db.session.commit()
        return jsonify({'message': 'Saved', 'company': comp.to_dict()}), 201
    companies = Company.query.all()
    res = []
    for c in companies:
        d = c.to_dict(); d['eco_score'] = calculate_eco_score(c); res.append(d)
    return jsonify(res)

@main_bp.route('/trade', methods=['POST'])
def execute_trade():
    data = request.json
    seller = Company.query.get(data.get('seller_id'))
    buyer = Company.query.get(data.get('buyer_id'))
    amount = float(data.get('amount'))
    if not seller or not buyer or seller.credits_balance < amount: return jsonify({'error': 'Invalid trade'}), 400
    seller.credits_balance -= amount
    buyer.credits_balance += amount
    db.session.add(Trade(seller_id=seller.id, buyer_id=buyer.id, amount=amount))
    db.session.commit()
    return jsonify({'message': 'Success'})

@main_bp.route('/rankings', methods=['GET'])
def get_rankings():
    companies = Company.query.all()
    ranking_tree = AVLTree()
    for c in companies: ranking_tree.add(c)
    res = []
    for c in ranking_tree.get_sorted()[::-1]:
        d = c.to_dict(); d['eco_score'] = calculate_eco_score(c); res.append(d)
    return jsonify(res)

@main_bp.route('/network', methods=['GET'])
def get_network():
    companies = Company.query.all()
    trades = Trade.query.filter_by(status='completed').all()
    trade_network = Graph()
    for c in companies: trade_network.add_node(c.id)
    for t in trades: trade_network.add_edge(t.seller_id, t.buyer_id, t.amount)
    return jsonify({'nodes': [{'id': c.id, 'label': c.name} for c in companies], 'edges': trade_network.get_edges()})

@main_bp.route('/history', methods=['GET'])
def get_history():
    trades = Trade.query.order_by(Trade.timestamp.asc()).all()
    history_queue = Queue()
    for t in trades:
        history_queue.enqueue({'seller': t.seller_id, 'buyer': t.buyer_id, 'amount': t.amount, 'status': t.status, 'type': t.trade_type, 'timestamp': t.timestamp.isoformat()})
    return jsonify(history_queue.get_all())
