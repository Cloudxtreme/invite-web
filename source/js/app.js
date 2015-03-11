var React = require('react');
var Router = require('react-router');
var http = require('http');

var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Welcome = require("./welcome");
var Create  = require("./create");

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

var routes = (
	<Route name="app" path="/" handler={App}>
		<Route name="create" path="/:token" handler={Create} />
		<DefaultRoute handler={Welcome} />
	</Route>
);

Router.run(routes, function (Handler) {
	React.render(<Handler/>, document.body);
});