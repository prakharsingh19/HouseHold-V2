from celery import shared_task
import time
from flask_security import auth_required, current_user as user
import flask_excel
from backend.models import db, ServiceCategory, History,Professional,Customer
from backend.celery.mail_service import send_email

    

@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    all_service_category = ServiceCategory.query.all()

    task_id = self.request.id
    filename = f'service_category.csv'
    column_names = [column.name for column in ServiceCategory.__table__.columns]
    print(column_names)
    csv_out = flask_excel.make_response_from_query_sets(all_service_category, column_names = column_names, file_type='csv' )

    with open(f'./backend/celery/user-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)
    
#     return filename

@shared_task(bind = True, ignore_result = False)
def history_csv(self):
    
    pro = Professional.query.get(user.id)
    cust = Customer.query.get(user.id)
    if pro:
        result = History.query.filter_by(professional_id=pro.id)
    else:
        result = History.query.filter_by(customer_id=cust.id)
    # result = History.query.all()
    # task_id = self.request.id
    print(user)
    filename = f'history.csv'
    column_names = [column.name for column in History.__table__.columns]
    print(column_names)
    csv_out = flask_excel.make_response_from_query_sets(result, column_names = column_names, file_type='csv' )

    with open(f'./backend/celery/user-downloads/history.csv', 'wb') as file:
        file.write(csv_out.data)


@shared_task(ignore_result = True)
def email_reminder(to, subject, content):
    send_email(to, subject, content)