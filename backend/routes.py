from flask import current_app as app, jsonify, render_template ,request, send_file
from flask_security import auth_required, verify_password, hash_password
from backend.models import db,Customer,User,Role,Professional
from backend.celery.tasks import create_csv, history_csv
from celery.result import AsyncResult
from datetime import datetime

datastore = app.security.datastore
cache = app.cache


@app.route('/')
def home():
    return render_template('index.html')


@auth_required('token') 
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)
    if result.ready():
        return send_file(f'./backend/celery/user-downloads/service_category.csv'), 200
    else:
        return {'message' : 'task not ready'}, 405

@auth_required('token')
@app.get('/get-history/<id>')
def getHistory(id):
    result = AsyncResult(id)
    if result.ready():
        return send_file(f'./backend/celery/user-downloads/history.csv'), 200
    else:
        return {'massage' : 'task not ready'},405

@auth_required('token') 
@app.get('/create-csv')
def createCSV():
    task = create_csv.delay()
    return {'task_id' : task.id}, 200

@auth_required('token')
@app.get('/history-csv')
def historyCSV():
    task = history_csv.delay()
    return {'task_id': task.id},200

@app.get('/cache')
@cache.cached(timeout = 5)
def cache():
    return {'time' : str(datetime.now())}



@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        # Extract email and password from request
        email = data.get('email')
        password = data.get('password')

        # Validation
        if not email or not password:
            return jsonify({"message": "Invalid inputs"}), 400

        # Find the user by email
        user = datastore.find_user(email=email)
        if not user:
            return jsonify({"message": "Invalid email"}), 404

        # Verify password
        if not verify_password(password, user.password):
            return jsonify({"message": "Invalid password"}), 401

        # Check if the user is a professional
        professional = Professional.query.filter_by(id=user.id).first()

        if professional:
            # If the user is a professional, check verification status
            if professional.is_verified:
                # Verified professional
                return jsonify({
                    'token': user.get_auth_token(),
                    'email': user.email,
                    'role': user.roles[0].name,
                    'id': user.id
                }), 200
            else:
                # Not verified
                # print('not verified yet')
                return jsonify({"message": "You're not verified yet"}), 403
        elif not user.active:
            return jsonify({"message": "You're Blocked by Admin"}), 403
        else:
            # If not a professional, process as a regular user
            return jsonify({
                'token': user.get_auth_token(),
                'email': user.email,
                'role': user.roles[0].name,
                'id': user.id
            }), 200
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({"message": "An error occurred during login"}), 500




@app.route('/registerUser', methods=['POST'])
def register_customer():
    try:
        data = request.get_json()

        # Debugging: Log input data
        print("Received data:", data)

        # Extract data from the request
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        address = data.get('address')
        phone = data.get('phone')

        # Validation
        if not all([name, email, password, address, phone]):
            print("Validation failed: Missing fields")
            return jsonify({"message": "All fields are required"}), 400

        # Check if the user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print("User already exists with email:", email)
            return jsonify({"message": "User already exists"}), 400

        # Step 1: Create a new user
        hashed_password = hash_password(password)
        datastore.create_user(name=name, email=email, password=hashed_password, active=True)
        db.session.commit()
        new_user=User.query.filter_by(email=email).first()
        # Assign the 'customer' role to the user
        customer_role = Role.query.filter_by(name="customer").first()
        if customer_role:
            print("Assigning customer role")
            new_user.roles.append(customer_role)

        db.session.add(new_user)
        db.session.commit()
        print("User created successfully:", new_user.id)

        # Step 2: Create a Customer profile
        customer = Customer(id=new_user.id, address=address, phone=phone)
        db.session.add(customer)
        db.session.commit()
        print("Customer profile created successfully:", customer.id)

        return jsonify({"message": "Customer registered successfully", "user_id": new_user.id}), 201

    except Exception as e:
        # Rollback and log the error
        db.session.rollback()
        print("Error occurred:", str(e))
        return jsonify({"message": f"Error registering customer: {str(e)}"}), 500

@app.route('/registerPro', methods=['POST'])
def register_professional():
    try:
        data = request.get_json()

        # Extract data from the request
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        # service_type = data.get('service_type')
        experience = data.get('experience')
        category_id = data.get('category_id')
        print(category_id)

        # Validation
        if not all([name, email, password, experience, category_id]):
            return jsonify({"message": "All fields are required"}), 400

        # Check if the user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"message": "User already exists"}), 400

        # Step 1: Create a new user
        hashed_password = hash_password(password)
        datastore.create_user(name=name, email=email, password=hashed_password, active=True)
        db.session.commit()

        # Get the created user
        new_user = User.query.filter_by(email=email).first()

        # Assign the 'professional' role to the user
        professional_role = Role.query.filter_by(name="professional").first()
        if professional_role:
            new_user.roles.append(professional_role)
        db.session.add(new_user)
        db.session.commit()

        # Step 2: Create a Professional profile
        professional = Professional(
            id=new_user.id,
            # service_type=service_type,
            experience=experience,
            category_id=category_id,
        )
        db.session.add(professional)
        db.session.commit()

        return jsonify({"message": "Professional registered successfully", "user_id": new_user.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error registering professional: {str(e)}"}), 500
