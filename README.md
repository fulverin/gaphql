graphql task

Pitch :
So the idea is to provide a page that takes your kood-johvi credentials,
ask validation of those credentials to a specific endpoint.
As confirmation, the client receive a JWT token that prove that your credentials have been validated.
Then you make request to the actual server, the server check JWT are valid, and satisfy the request.
request here is graphql querys that ask data to database in the preise shape of the needed object.
It does not have to be subject to how database tables are exatcly designed.
Finally information about your kood profile are displayed as tab or graph.

(the idea behind JWT is to separate the credential validation from the place that hold the actual data)

Usage :
start the python server script
start_python_server.sh
then go the displayed address with your browser

self hosted version :
https://fulverin.github.io/gaphql/