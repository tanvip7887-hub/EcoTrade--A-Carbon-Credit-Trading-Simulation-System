from app import create_app
from app.models import db, Company

app = create_app()

def delete_infobyte():
    with app.app_context():
        comp = Company.query.get('C008')
        if comp:
            db.session.delete(comp)
            db.session.commit()
            print("Infobyte (C008) deleted successfully.")
        else:
            print("Infobyte not found.")

if __name__ == "__main__":
    delete_infobyte()
