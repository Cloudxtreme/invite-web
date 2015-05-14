var React = require('react');
var Router = require('react-router');

var DefaultRoute = Router.DefaultRoute;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Welcome   = require("./welcome");
var Create    = require("./create");

var App = React.createClass({
	stateCallback: function(c) {
		this.refs.container.getDOMNode().className = "container " + c;
	},

	render: function() {
		return (
			<div ref="container" className="container">
				<img src="/img/logo.svg" />
				
				<RouteHandler stateCallback={this.stateCallback} />
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
	React.render(<Handler />, document.body);
});