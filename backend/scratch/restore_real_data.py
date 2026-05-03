from app import create_app
from app.models import db, Company

app = create_app()

def restore_data():
    with app.app_context():
        print("Restoring your real company data...")
        db.drop_all() # Clean start to ensure no conflicts
        db.create_all()
        
        real_companies = [
            Company(id='C001', name='EcoCorp', email='contact@ecocorp.com', password='pass1', industry='Tech', emissions=500, credits_allocated=1000, credits_balance=500),
            Company(id='C003', name='CarbonReduce', email='support@carbonreduce.com', password='pass3', industry='Logistics', emissions=800, credits_allocated=1500, credits_balance=700),
            Company(id='C004', name='SolarFuture', email='hello@solarfuture.com', password='pass4', industry='Energy', emissions=300, credits_allocated=1200, credits_balance=900),
            Company(id='C005', name='WindPower', email='power@windpower.com', password='pass5', industry='Energy', emissions=100, credits_allocated=2000, credits_balance=1900),
            Company(id='C006', name='FutureEnergy', email='future@gmail.com', password='future123', industry='Manufacturing', emissions=0, credits_allocated=0, credits_balance=0),
            Company(id='C007', name='greeninfo', email='green@gmail.com', password='green123', industry='Energy', emissions=0, credits_allocated=0, credits_balance=0),
            Company(id='C008', name='infobyte', email='info@gmail.com', password='info123', industry='Tech', emissions=500, credits_allocated=0, credits_balance=-500),
        ]
        
        db.session.add_all(real_companies)
        db.session.commit()
        print(f"Successfully restored {len(real_companies)} companies!")

if __name__ == "__main__":
    restore_data()
