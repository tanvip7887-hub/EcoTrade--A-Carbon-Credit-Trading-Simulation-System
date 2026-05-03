from app import create_app
from app.models import db, Company

app = create_app()

def initialize_database():
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        
        # Check if we already have data
        if Company.query.first() is None:
            print("Adding initial simulation data...")
            initial_companies = [
                Company(id='C001', name='EcoCorp', email='contact@ecocorp.com', password='password', industry='Tech', emissions=500, credits_allocated=2000, credits_balance=1500),
                Company(id='C003', name='CarbonReduce', email='support@carbonreduce.com', password='password', industry='Logistics', emissions=800, credits_allocated=1000, credits_balance=200),
                Company(id='C004', name='SolarFuture', email='hello@solarfuture.com', password='password', industry='Energy', emissions=300, credits_allocated=1200, credits_balance=900),
            ]
            db.session.add_all(initial_companies)
            db.session.commit()
            print("Database initialized successfully!")
        else:
            print("Database already contains data. Skipping initialization.")

if __name__ == "__main__":
    initialize_database()
