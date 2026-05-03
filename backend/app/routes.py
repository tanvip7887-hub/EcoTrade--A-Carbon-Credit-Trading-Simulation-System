from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from .models import db, Company, Trade
from .data_structures import AVLTree, Graph, Queue, Stack
from datetime import datetime

main_bp = Blueprint('main', __name__)

def calculate_eco_score(company_obj):
    if not company_obj.credits_allocated or company_obj.credits_allocated == 0: return 0
    ratio = company_obj.emissions / company_obj.credits_allocated
    if ratio < 0.4: return 98
    if ratio < 0.7: return 80
    if ratio < 1.0: return 60
    return 30

@main_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    comp_id = data.get('company_id')
    if Company.query.get(comp_id):
        return jsonify({"msg": "Entity ID already registered"}), 400
        
    new_company = Company(
        id=comp_id,
        name=data.get('name'),
        email=data.get('email', f"{comp_id}@ecotrade.com"),
        industry=data.get('industry', 'Other'),
        emissions=0.0,
        credits_allocated=0.0,
        credits_balance=0.0
    )
    new_company.set_password(data.get('password'))
    db.session.add(new_company)
    db.session.commit()
    return jsonify({"msg": "Registration successful. Pending admin allocation."}), 201

@main_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    company_id = data.get('company_id')
    password = data.get('password')
    
    if company_id == 'admin' and password == 'password':
        return jsonify(access_token=create_access_token(identity='admin'), role='admin')
    
    company = Company.query.get(company_id)
    if company and company.check_password(password):
        return jsonify(access_token=create_access_token(identity=company.id), role='company', company=company.to_dict())
    
    return jsonify({"msg": "Invalid credentials"}), 401

@main_bp.route('/companies', methods=['GET', 'POST'])
@jwt_required()
def handle_companies():
    if get_jwt_identity() != 'admin': return jsonify({'error': 'Admin only'}), 403
    
    if request.method == 'POST':
            
        data = request.json
        comp_id = data.get('company_id')
        comp = Company.query.get(comp_id)
        
        if not comp:
            comp = Company(id=comp_id, name=data.get('name'), email=data.get('email', f"{comp_id}@eco.com"))
            db.session.add(comp)
            msg = f"New entity {comp_id} registered."
        else:
            comp.name = data.get('name', comp.name)
            msg = f"Allocation updated for {comp_id}."

        comp.emissions = float(data.get('emissions', comp.emissions))
        comp.credits_allocated = float(data.get('credits_allocated', comp.credits_allocated))
        comp.credits_balance = comp.credits_allocated - comp.emissions
        if data.get('password'): comp.set_password(data.get('password'))
        
        db.session.commit()
        return jsonify({'message': msg, 'company': comp.to_dict()}), 201
    
    companies = Company.query.all()
    res = []
    for c in companies:
        d = c.to_dict()
        d['eco_score'] = calculate_eco_score(c)
        res.append(d)
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
        d = c.to_dict()
        d['eco_score'] = calculate_eco_score(c)
        res.append(d)
    return jsonify(res)

@main_bp.route('/network', methods=['GET'])
def get_network():
    companies = Company.query.all()
    # Only show active, non-reverted trades in the network graph
    trades = Trade.query.filter_by(status='completed', trade_type='Trade').all()
    trade_network = Graph()
    for c in companies: trade_network.add_node(c.id)
    for t in trades: trade_network.add_edge(t.seller_id, t.buyer_id, t.amount)
    return jsonify({
        'nodes': [{'id': c.id, 'label': c.name} for c in companies],
        'edges': trade_network.get_edges()
    })

@main_bp.route('/history', methods=['GET'])
def get_history():
    trades = Trade.query.order_by(Trade.timestamp.desc()).all()
    history_queue = Queue()
    for t in trades:
        history_queue.enqueue({'seller': t.seller_id, 'buyer': t.buyer_id, 'amount': t.amount, 'status': t.status, 'type': t.trade_type, 'timestamp': t.timestamp.isoformat()})
    return jsonify(history_queue.get_all())

@main_bp.route('/stats', methods=['GET'])
def get_stats():
    companies = Company.query.all()
    trades = Trade.query.filter_by(status='completed', trade_type='Trade').all()
    
    total_companies = len(companies)
    total_trades = len(trades)
    total_emissions = sum(c.emissions for c in companies)
    
    # Use AVL Tree to find the top company
    ranking_tree = AVLTree()
    for c in companies: ranking_tree.add(c)
    top_c = ranking_tree.get_sorted()[-1] if companies else None
    
    return jsonify({
        'total_companies': total_companies,
        'total_trades': total_trades,
        'total_emissions': int(total_emissions),
        'top_company': top_c.name if top_c else 'N/A'
    })
