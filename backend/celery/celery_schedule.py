from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder
from backend.models import User

celery_app = app.extensions['celery']


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # every 10 seconds
    email_address=[user.email for user in User.query.all()]

    if email_address:
        for address in email_address:
                sender.add_periodic_task(10, email_reminder.s(address, 'reminder to login', '<h1> hello everyone login to our site and explore the avaliable services</h1>') )
    # # daily message at 6:55 pm, everyday
    # sender.add_periodic_task(crontab(hour=18, minute=27), email_reminder.s('students@gmail', 'reminder to login', '<h1> hello everyone </h1>'), name='daily reminder' )

    # # weekly messages
    # sender.add_periodic_task(crontab(hour=18, minute=27, day_of_week='monday'), email_reminder.s('students@gmail', 'reminder to login', '<h1> hello everyone </h1>'), name = 'weekly reminder' )






