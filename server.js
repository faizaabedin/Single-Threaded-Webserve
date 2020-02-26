const express = require('express')
const app = express()
const port = 3000;

let content_type,content_length,text; 
app.get('/index.html', (request, response) => {
	console.log(request.headers);
	console.log(request.body);
})
app.head('/', (request, response) => {
	response.send('Hello from Express!')
})
app.post('/', (request, response) => {
	response.send('Hello from Express!')
})
app.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}

	console.log(`server is listening on ${port}`)
})