var React  = require("react");
var Router = require("react-router");
var http   = require("http");
var auth   = require("./auth");
var crypto = require("crypto");

module.exports = {}

var requireAuth = function(Component) {
	return React.createClass({
		statics: {
			willTransitionTo: function(transition) {
				if (!auth.loggedIn()) {
					transition.redirect('/admin', {}, {'nextPath' : transition.path});
				}
			},
		},
		render: function() {
			return <Component {...this.props}/>
		}
	});
};

module.exports.Auth = React.createClass({
	mixins: [Router.Navigation, Router.State],

	componentDidMount: function() {
		this.props.stateCallback("container-auth");
	},

	handleSubmit: function(e) {
		e.preventDefault();

		var self = this;

		var username = this.refs.username.getDOMNode().value;
		var password = this.refs.password.getDOMNode().value;

		// hash the password
		var hash = crypto.createHash("sha256");
		hash.update(password);
		password = hash.digest("hex");

		console.log(password);
	
		auth.login(username, password, function(result) {
			var nextPath = self.getQuery().nextPath;

			if (nextPath) {
				self.context.replaceWith(nextPath);
			} else {
				self.context.replaceWith('/about');
			}
		});
	},

	render: function() {
		return (
			<div className="login">
				<h2>Log in to access the admin UI</h2>
				<form onSubmit={this.handleSubmit}>
					<input ref="username" type="text" placeholder="Username" />
					<input ref="password" type="password" placeholder="Password" />
					<button ref="submit" type="submit">
						Log in
					</button>
				</form>		
			</div>
		);
	}
});

module.exports.Dashboard = requireAuth(React.createClass({
	render: function() {
		return (
			<p>HELLO WORLD DASHBOARD</p>
		)
	}
}));