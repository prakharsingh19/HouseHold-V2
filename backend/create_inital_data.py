from flask import current_app as app
from backend.models import *
from flask_security import SQLAlchemyUserDatastore, hash_password


with app.app_context():
    db.create_all()

    userdatastore : SQLAlchemyUserDatastore = app.security.datastore

    userdatastore.find_or_create_role(name = 'admin', description='superuser')
    userdatastore.find_or_create_role(name= 'customer', description= 'our god')
    userdatastore.find_or_create_role(name = 'professional', description='bussiness makers')

    if (not userdatastore.find_user(email='admin@study.iitm.ac.in')):
        category1 = ServiceCategory(name="Home Cleaning", description= "All cleaning services", tags= "cleaning, house, maintenance")
        category2 = ServiceCategory(name="Salon", description= "Salon services at home ", tags= "haircut, trimming")
        category3 = ServiceCategory(name="Home Repair", description= "Repairing of Furniture, Wall ", tags= "Door repairing , table, ")
        db.session.add(category1)
        db.session.add(category2)
        db.session.add(category3)

        db.session.commit()
        service1 = Service(name = "Floor Cleaning", price = 200, time_required= 30,description='You have to give your cleanser',category_id=1)
        service2 = Service(name = "Haircut", price = 500, time_required= 60,description='Hair cut and set',category_id=2)
        service3 = Service(name = "Furniture repair", price = 500, time_required= 50,description='Wooden service' ,category_id=3)
        db.session.add(service1)
        db.session.add(service2)
        db.session.add(service3)
        userdatastore.create_user(name='admin',email='admin@study.iitm.ac.in',password=hash_password('pass'),roles=['admin'])
    

    db.session.commit()