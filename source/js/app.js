var React = require('react');
var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var App = React.createClass({
	render: function() {
		return (
			<div className="container">
				<img src="http://i.imgur.com/1tSa6U6.png" />
				
				<RouteHandler />
			</div>
		);
	}
});

var Create = React.createClass({
	render: function() {
		return (
			<span>Hello worlds</span>
		);
	}
});

var Welcome = React.createClass({
	handleSubmit: function(e) {
		e.preventDefault();

		var token = React.findDOMNode(this.refs.token);
		if (!token) {
			return;
		}

		console.log(token);
	},
	render: function() {
		return (
			<div className="welcome">
				<h1>Welcome to Lavaboom!</h1>
				<h2>Please type in your invitation code to proceed.</h2>
				
				<form onSubmit={this.handleSubmit}>
					<input ref="token" type="text" placeholder="invitation code" />
					<button type="submit">&#xf13e;</button>
				</form>
			</div>
		);
	}
});

var routes = (
	<Route name="app" path="/" handler={App}>
		<Route name="create" path="/:token" handler={Create} />
		<DefaultRoute handler={Welcome} />
	</Route>
);

Router.run(routes, function (Handler) {
	React.render(<Handler/>, document.body);
});