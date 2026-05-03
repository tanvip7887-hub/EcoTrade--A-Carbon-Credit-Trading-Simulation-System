from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from .models import db, Company, Trade
from .data_structures import AVLTree, Graph, Queue, Stack
from datetime import datetime
import re

main_bp = Blueprint('main', __name__)

# Full Professional Eco-Score Calculation
def calculate_eco_score(company_obj):
    if not company_obj.credits_allocated or company_obj.credits_allocated == 0:
        return 0
    ratio = company_obj.emissions / company_obj.credits_allocated
    if ratio < 0.4: return 98 # A+
    if ratio < 0.6: return 85 # A
    if ratio < 0.8: return 70 # B
    if ratio < 1.0: return 55 # C
    return 30 # D

@main_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    comp_id = data.get('company_id')
    if Company.query.get(comp_id):
        return jsonify({"msg": "Company ID already exists"}), 400
        
    new_company = Company(
        id=comp_id,
        name=data.get('name'),
        email=data.get('email'),
        industry=data.get('industry', 'Other'),
        emissions=0.0,
        credits_allocated=0.0,
        credits_balance=0.0
    )
    new_company.set_password(data.get('password'))
    db.session.add(new_company)
    db.session.commit()
    return jsonify({"msg": "Registration successful"}), 201

@main_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    company_id = data.get('company_id')
    password = data.get('password')
    
    if company_id == 'admin' and password == 'password':
        access_token = create_access_token(identity='admin')
        return jsonify(access_token=access_token, role='admin')
    
    company = Company.query.get(company_id)
    if company and company.check_password(password):
        access_token = create_access_token(identity=company.id)
        return jsonify(access_token=access_token, role='company', company=company.to_dict())
    
    return jsonify({"msg": "Bad credentials"}), 401

@main_bp.route('/companies', methods=['GET', 'POST'])
def handle_companies():
    if request.method == 'POST':
        verify_jwt_in_request()
        if get_jwt_identity() != 'admin':
            return jsonify({'error': 'Unauthorized. Admin only.'}), 403
            
        data = request.json
        comp_id = data.get('company_id')
        comp = Company.query.get(comp_id)
        
        if not comp:
            # Create if new
            comp = Company(id=comp_id, name=data.get('name'), email=data.get('email', f"{comp_id}@eco.com"), industry=data.get('industry', 'Other'))
            db.session.add(comp)
            msg = f"Company {comp_id} created and allocated."
        else:
            # Update if existing
            comp.name = data.get('name', comp.name)
            comp.industry = data.get('industry', comp.industry)
            msg = f"Data for {comp_id} updated successfully."

        comp.emissions = float(data.get('emissions', comp.emissions))
        comp.credits_allocated = float(data.get('credits_allocated', comp.credits_allocated))
        comp.credits_balance = comp.credits_allocated - comp.emissions
        
        if data.get('password'):
            comp.set_password(data.get('password'))
        elif not comp.password:
            comp.set_password('password123') # Default password
            
        db.session.commit()
        return jsonify({'message': msg, 'company': comp.to_dict()}), 201
    
    # GET: Public listing
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
    
    if not seller or not buyer: return jsonify({'error': 'Invalid IDs'}), 400
    if seller.credits_balance < amount: return jsonify({'error': 'Insufficient credits'}), 400
    
    seller.credits_balance -= amount
    buyer.credits_balance += amount
    
    new_trade = Trade(seller_id=seller.id, buyer_id=buyer.id, amount=amount)
    db.session.add(new_trade)
    db.session.commit()
    return jsonify({'message': 'Trade successful'})

@main_bp.route('/trade/undo', methods=['POST'])
@jwt_required()
def undo_trade():
    if get_jwt_identity() != 'admin': return jsonify({'error': 'Admin only'}), 403
    
    last_trade = Trade.query.filter_by(status='completed').order_by(Trade.timestamp.desc()).first()
    if not last_trade: return jsonify({'error': 'No trades found'}), 400
    
    seller = Company.query.get(last_trade.seller_id)
    buyer = Company.query.get(last_trade.buyer_id)
    amount = last_trade.amount
    
    seller.credits_balance += amount
    buyer.credits_balance -= amount
    last_trade.status = 'reverted'
    
    # Log the undo
    undo_log = Trade(seller_id=last_trade.seller_id, buyer_id=last_trade.buyer_id, amount=amount, status='reverted', trade_type='Undo')
    db.session.add(undo_log)
    db.session.commit()
    return jsonify({'message': 'Last trade undone successfully'})

@main_bp.route('/rankings', methods=['GET'])
def get_rankings():
    companies = Company.query.all()
    ranking_tree = AVLTree()
    for c in companies: ranking_tree.add(c)
    sorted_list = ranking_tree.get_sorted()
    sorted_list.reverse()
    res = []
    for c in sorted_list:
        d = c.to_dict()
        d['eco_score'] = calculate_eco_score(c)
        res.append(d)
    return jsonify(res)

@main_bp.route('/network', methods=['GET'])
def get_network():
    companies = Company.query.all()
    trades = Trade.query.filter_by(status='completed').all()
    trade_network = Graph()
    for c in companies: trade_network.add_node(c.id)
    for t in trades: trade_network.add_edge(t.seller_id, t.buyer_id, t.amount)
    return jsonify({
        'nodes': [{'id': c.id, 'label': c.name} for c in companies],
        'edges': trade_network.get_edges()
    })

@main_bp.route('/history', methods=['GET'])
def get_history():
    trades = Trade.query.order_by(Trade.timestamp.asc()).all()
    history_queue = Queue()
    for t in trades:
        history_queue.enqueue({
            'seller': t.seller_id, 'buyer': t.buyer_id, 
            'amount': t.amount, 'status': t.status, 
            'type': t.trade_type, 'timestamp': t.timestamp.isoformat()
        })
    return jsonify(history_queue.get_all())
