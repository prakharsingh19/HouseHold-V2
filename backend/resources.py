from flask import jsonify, request, current_app as app 
from flask_restful import Api, Resource, fields, marshal_with,reqparse
from flask_security import auth_required, current_user
from backend.models import *
from datetime import datetime


cache=app.cache

api = Api(prefix='/api')


user= {
    'name':fields.String,
    'address':fields.String,
    'phone':fields.String,
    'id': fields.Integer,
    'email': fields.String,
    'roles': fields.List(fields.String),
}


professional_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'email': fields.String,
    # 'service_type': fields.String,
    'rating':fields.Float,
    'experience': fields.Integer,
    'is_verified': fields.Boolean,
}
customer = {
    'id':fields.Integer,
    'name':fields.String,
    'email':fields.String,
    'active': fields.Boolean,
    'phone': fields.String,
    'address': fields.String,
}

history_fields = {
    'id': fields.Integer,
    'customer_name': fields.String,
    'pro_name': fields.String,
    'service_name': fields.String,
    'category_name': fields.String,
    'date_of_completion': fields.DateTime,
}


service_category={
    'id':fields.Integer,
    'name':fields.String,
    'tags': fields.String,
}


service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'price': fields.Float,
    'time_required': fields.Integer,
    'description': fields.String,
    'category': fields.Nested(service_category),
}

service_request_fields = {
    'id': fields.Integer,
    'service': fields.Nested(service_fields),
    'customer_id': fields.Integer,
    'customer_name': fields.String,
    'customer_address':fields.String,
    'customer_phone': fields.String,
    'professional_id': fields.Integer,
    'date_of_request': fields.DateTime,
    'date_of_completion': fields.DateTime,
    'service_status': fields.String,
    'remarks': fields.String,
}

class UserResource(Resource):
    @marshal_with(user)
    @auth_required("token")
    def get(self):
        user = current_user
        customer=Customer.query.get(user.id)
        roles = [role.name for role in user.roles]
        return {
            'id': user.id,
            'email': user.email,
            'roles': roles,
            'name': user.name,
            'phone':customer.phone,
            'address': customer.address
        }
    
# class UserDetailResource(Resource):


class CustomersListResource(Resource):
    @marshal_with(customer)
    @auth_required('token')
    def get(self):
        query = request.args.get('query', '').lower()
        customers = (
            db.session.query(User, Customer)
            .join(Customer, User.id == Customer.id)
            .filter(
                db.or_(
                    User.name.ilike(f"%{query}%"),
                    User.email.ilike(f"%{query}%"),
                    Customer.phone.ilike(f"%{query}%"),
                )
            )
            .all()
        )

        # Map User and Customer data
        result = [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "active": user.active,
                "phone": customer.phone,
                "address": customer.address,
            }
            for user, customer in customers
        ]
        return result, 200


class CustomerDetailResource(Resource):
    @auth_required('token')
    def put(self, customer_id):
        print(f"Received PUT request for customer_id: {customer_id}")
        parser = reqparse.RequestParser()
        parser.add_argument('active', type=bool, required=True)
        args = parser.parse_args()
        print(f"Parsed arguments: {args}")

        # Fetch the customer
        customer = User.query.get(customer_id)
        if not customer:
            return {"message": "Customer not found"}, 404

        # Update active status
        customer.active = args['active']
        db.session.commit()

        status = "unblocked" if args['active'] else "blocked"
        return {"message": f"Customer successfully {status}"}, 200


class ServiceCategoryResource(Resource):
    @marshal_with(service_category)
    # @auth_required('token')
    # @cache.cached(timeout = 25 , key_prefix = "service_category")
    def get(self):
        # Fetch all categories
        categories = ServiceCategory.query.all()
        return categories,200

    @auth_required('token')
    def post(self):
        # Only allow admins to add categories
        user = current_user
        if not any(role.name == 'admin' for role in user.roles):
            return {"error": "Only admins can add categories"}, 403

        data = request.get_json()
        name = data.get('category')
        tags = data.get('tags')
        desc = data.get('desc')

        if not name:
            return {"error": "Category name is required"}, 400

        # Check if the category already exists
        existing_category = ServiceCategory.query.filter_by(name=name).first()
        if existing_category:
            return {"error": f"Category '{name}' already exists"}, 400

        # Create a new category
        category = ServiceCategory(name=name, description=desc, tags=tags)
        db.session.add(category)
        db.session.commit()

        return {"message": "Category added successfully"}, 201


class ProfessionalListResource(Resource):
    @marshal_with(professional_fields)
    @auth_required('token')
    def get(self):
        # Fetch all professionals
        professionals = (
            db.session.query(User, Professional)
            .join(Professional, User.id == Professional.id)
            .all()
        )
        # Map User and Professional data
        result = [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "experience": professional.experience,
                "is_verified": professional.is_verified,
                "rating":professional.rating,
            }
            for user, professional in professionals
        ]
        return result, 200

class ProfessionalUpdateResource(Resource):
    @auth_required('token')
    def put(self, professional_id):
        parser = reqparse.RequestParser()
        parser.add_argument('is_verified', type=bool, required=True)
        args = parser.parse_args()

        # Fetch the professional
        professional = Professional.query.get(professional_id)
        if not professional:
            return {"message": "Professional not found"}, 404

        # Update verification status
        professional.is_verified = args['is_verified']
        db.session.commit()

        return {"message": "Verification status updated successfully"}, 200

class ServiceResource(Resource):
    @marshal_with(service_fields)
    def get(self):
        search_query = request.args.get('query', '').lower()
        category_id = request.args.get('category_id')

        query = Service.query
        if search_query:
            query = query.filter(
                db.or_(
                    Service.name.ilike(f"%{search_query}%"),
                    Service.description.ilike(f"%{search_query}%"),
                )
            )
        if category_id:
            query = query.filter_by(category_id=category_id)

        services = query.all()
        return services, 200

    @auth_required('token')
    def post(self):
        user = current_user
        if not any(role.name == 'admin' for role in user.roles):
            return {"error": "Only admins can add services"}, 403

        data = request.get_json()
        name = data.get('name')
        price = data.get('price')
        time_required = data.get('time_required')
        description = data.get('description')
        category_id = data.get('category_id')

        if not all([name, price, time_required, category_id]):
            return {"error": "All fields are required"}, 400

        category = ServiceCategory.query.get(category_id)
        if not category:
            return {"error": "Invalid category ID"}, 404

        service = Service(
            name=name,
            price=price,
            time_required=time_required,
            description=description,
            category_id=category_id,
        )
        db.session.add(service)
        db.session.commit()
        return {"message": "Service added successfully"}, 201

    @auth_required('token')
    def put(self, service_id):
        user = current_user
        if not any(role.name == 'admin' for role in user.roles):
            return {"error": "Only admins can edit services"}, 403

        service = Service.query.get(service_id)
        if not service:
            return {"error": "Service not found"}, 404

        data = request.get_json()
        service.name = data.get('name', service.name)
        service.price = data.get('price', service.price)
        service.time_required = data.get('time_required', service.time_required)
        service.description = data.get('description', service.description)
        service.category_id = data.get('category_id', service.category_id)

        db.session.commit()
        return {"message": "Service updated successfully"}, 200

    @auth_required('token')
    def delete(self, service_id):
        user = current_user
        if not any(role.name == 'admin' for role in user.roles):
            return {"error": "Only admins can delete services"}, 403

        service = Service.query.get(service_id)
        if not service:
            return {"error": "Service not found"}, 404

        # Remove related dependencies (e.g., requests linked to this service)
        ServiceRequest.query.filter_by(service_id=service_id).delete()
        db.session.delete(service)
        db.session.commit()
        return {"message": "Service deleted successfully"}, 200

# List resource for all service requests
class ServiceRequestListResource(Resource):
    @marshal_with(service_request_fields)
    @auth_required('token')
    def get(self):
        user = current_user
    # If the user is a professional
        if any(role.name == 'professional' for role in user.roles):
            # Fetch professional details
            professional = Professional.query.get(user.id)
            if not professional:
                return {"message": "Professional record not found"}, 404

            # Query for matching service requests
            requests = (
                ServiceRequest.query
                .join(Service, ServiceRequest.service_id == Service.id)
                .filter(
                    ServiceRequest.service_status == "requested",
                    Service.category_id == professional.category_id  # Matching categories
                )
                .all()
            )
            new_requests=[]
            for request in requests:
                request_data = {
                    'id': request.id,
                    'service': request.service,  # Assuming service relationship is lazy loaded
                    'customer_id': request.customer_id,
                    'customer_name': User.query.get(request.customer_id).name,
                    'customer_address': Customer.query.get(request.customer_id).address,
                    'customer_phone': Customer.query.get(request.customer_id).phone,
                    'professional_id': request.professional_id,
                    'date_of_request': request.date_of_request,
                    'date_of_completion': request.date_of_completion,
                    'service_status': request.service_status,
                    'remarks': request.remarks,
                }
                new_requests.append(request_data)
            requests=new_requests
        else:
            # If the user is not a professional, return requests made by the customer
            requests = ServiceRequest.query.filter_by(customer_id=user.id).all()

        print(requests)  # Debugging output to check the results
        return requests, 200

    @auth_required('token')
    def post(self):
        try:
            # Parse the incoming JSON payload
            data = request.get_json()
            if not data:
                return {"error": "Invalid or missing JSON body"}, 400
            
            # Extract required data from JSON
            service_id = data.get("service_id")
            if not service_id:
                return {"error": "Service ID is required"}, 400
            
            # Get the current user and verify they are a customer
            user = current_user
            customer = Customer.query.get(user.id)
            if not customer:
                return {"error": "Only customers can request services"}, 403

            # Create a new service request
            service_request = ServiceRequest(
                service_id=service_id,
                customer_id=customer.id,
                date_of_request=datetime.utcnow(),
                service_status="requested"
            )
            db.session.add(service_request)
            db.session.commit()

            return {"message": "Service request created successfully", "request_id": service_request.id}, 201
        
        except Exception as e:
            return {"error": f"An unexpected error occurred: {str(e)}"}, 500

# Detail resource for individual service requests
class ServiceRequestDetailResource(Resource):
    @auth_required('token')
    def patch(self, request_id):
        data = request.get_json()
        action = data.get('action')  # 'accept' or 'close'

        # Fetch the service request
        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return {"message": "Service request not found"}, 404

        # Handle actions
        if action == 'accept':
            # Only professionals can accept a request
            professional = Professional.query.get(current_user.id)
            if not professional:
                return {"message": "Only professionals can accept service requests"}, 403

            # Ensure the service is in the professional's category
            if service_request.service.category_id != professional.category_id:
                return {"message": "You are not eligible to accept this service request"}, 403

            # Update the request to assigned
            service_request.professional_id = professional.id
            service_request.service_status = 'assigned'

        elif action == 'close':
            # Only the customer can close a request
            if current_user.id != service_request.customer_id:
                return {"message": "Only the customer can close the request"}, 403

            # Ensure the request is already assigned
            if service_request.service_status != 'assigned':
                return {"message": "Cannot close a request that is not assigned"}, 400

            # Update the request to closed
            service_request.service_status = 'closed'
            service_request.date_of_completion = datetime.utcnow()

        else:
            return {"message": "Invalid action specified"}, 400

        # Commit updates to the database
        db.session.commit()
        recent_service = ServiceRequest.query.get(request_id)
        history = History(
            customer_id = recent_service.customer_id,
            professional_id = recent_service.professional_id,
            customer_name = User.query.get(recent_service.customer_id).name,
            date_of_completion= recent_service.date_of_completion,
            pro_name = User.query.get(recent_service.professional_id).name,
            service_name = Service.query.get(recent_service.service_id).name,
            category_name = ServiceCategory.query.get(Service.query.get(recent_service.service_id).category_id).name
        )
        db.session.add(history)
        db.session.commit()
        return {"message": f"Request {action}ed successfully"}, 200

    @auth_required('token')
    def put(self, request_id):
        try:
            # Parse JSON body
            data = request.get_json()
            if not data:
                return {"error": "Invalid or missing JSON body"}, 400
            
            # Get the current professional
            user = current_user
            professional = Professional.query.get(user.id)
            if not professional:
                return {"error": "Only verified professionals can accept services"}, 403
            
            # Check if the professional is verified
            if not professional.is_verified:
                return {"error": "Your account is not verified to accept service requests"}, 403
            
            # Find the service request
            service_request = ServiceRequest.query.get(request_id)
            if not service_request:
                return {"error": "Service request not found"}, 404

            # Ensure the professional is in the correct category
            if service_request.service.category_id != professional.category_id:
                return {"error": "You are not eligible to accept this service request"}, 403

            # Update the service request status
            service_request.professional_id = professional.id
            service_request.service_status = "assigned"
            db.session.commit()

            return {"message": "Service request accepted successfully"}, 200
        
        except Exception as e:
            return {"error": f"An unexpected error occurred: {str(e)}"}, 500

class CustomerServiceRequestsResource(Resource):
    @auth_required('token')
    def get(self):
        user = current_user
        customer = Customer.query.get(user.id)
        if not customer:
            return {"error": "Only customers can view service requests"}, 403
        
        # Fetch service requests for the customer
        service_requests = ServiceRequest.query.filter_by(customer_id=customer.id).all()
        result = [
            {
                "id": request.id,
                "service_name": request.service.name,
                "service_status": request.service_status,
                "professional": {
                    "name": request.professional.user.name,
                    "rating": request.professional.rating,
                } if request.professional else None,
            }
            for request in service_requests
        ]
        return result, 200

class HistoryResource(Resource):
    @marshal_with(history_fields)
    @auth_required('token')  # Ensure the user is authenticated
    def get(self):
        # Fetch the current user
        user = current_user

        # Check if the user is a customer
        if any(role.name == 'customer' for role in user.roles):
            # Fetch history for the customer
            customer_history = History.query.filter_by(customer_id=user.id).all()
            return customer_history, 200

        # Check if the user is a professional
        if any(role.name == 'professional' for role in user.roles):
            # Fetch history for the professional
            professional_history = History.query.filter_by(professional_id=user.id).all()
            return professional_history, 200

        # If the user is neither a customer nor professional
        return {"message": "User is not authorized to view history"}, 403

api.add_resource(UserResource, '/dashboard')


api.add_resource(CustomersListResource, '/customers')
api.add_resource(CustomerDetailResource,'/customer/<int:customer_id>')


api.add_resource(ServiceCategoryResource, '/categories')


api.add_resource(ProfessionalListResource, '/professionals')
api.add_resource(ProfessionalUpdateResource, '/professionals/<int:professional_id>')
# Use separate classes for list and detail views
api.add_resource(ServiceResource, '/services', '/services/<int:service_id>')

api.add_resource(ServiceRequestListResource, '/service_requests')  # List and create requests
api.add_resource(ServiceRequestDetailResource, '/service_requests/<int:request_id>')  # Operations on individual requests

api.add_resource(CustomerServiceRequestsResource, '/customer_requests')

api.add_resource(HistoryResource, '/history')