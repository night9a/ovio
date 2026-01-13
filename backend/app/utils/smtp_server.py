#method to send emails all for verification and 
#reset and also in future to the users apps like someone 
#put a button to send email in his app it can work

from mailjet_rest import Client
import os
from ..config import DevelopmentConfig

config = DevelopmentConfig()

api_key = config.MJ_APIKEY_PUBLIC
api_secret = config.MJ_APIKEY_PRIVATE
mail = config.MAIL
mailjet = Client(auth=(api_key, api_secret), version='v3.1')

def send_mail(to: str,data: str):
		data = {
			'Messages': [
						{
								"From": {
										"Email": mail,
										"Name": "Mailjet Pilot"
								},
								"To": [
										{
												"Email": "nightxcros@gmail.com",
												"Name": "passenger 1"
										}
								],
								"Subject": "Your email flight plan!",
								"TextPart": "Dear passenger 1, welcome to Mailjet! May the delivery force be with you!",
								"HTMLPart": "<h3>Dear passenger 1, welcome to <a href=\"https://www.mailjet.com/\">Mailjet</a>!</h3><br />May the delivery force be with you!"
						}
				]
		}
		result = mailjet.send.create(data=data)
		print(result.status_code)
		print(result.json())
