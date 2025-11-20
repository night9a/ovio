# app/modules/auth/schemas.py
from marshmallow import Schema, fields, validate




class RegisterSchema(Schema):
email = fields.Email(required=True)
password = fields.Str(required=True, validate=validate.Length(min=8))
name = fields.Str(required=False)




class LoginSchema(Schema):
email = fields.Email(required=True)
password = fields.Str(required=True)