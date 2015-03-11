var React  = require("react");
var Router = require("react-router");
var http   = require("http");

module.exports = React.createClass({
	mixins: [Router.State],

	setButtonState: function(b) {
		this.refs.submit.getDOMNode().disabled = !b;
	},

	getInitialState: function() {
		return {token: {}};
	},
	componentDidMount: function() {
		// We shouldn't really query it twice, but I'm not sure how should
		// I accomplish this without setting up a whole event system. 

		var self = this;
		var params = this.getParams();

		http.request({
			method: "POST",
			path:   "/check",
			host:   "127.0.0.1",
			port:   8000,
		}, function(res) {
			// Gather the response
			var buffer = "";
			res.on("data", function(buf) { buffer += buf; });

			res.on("end", function() {
				// Parse the response
				var result = JSON.parse(buffer);

				// Put the result into the state
				self.setState({token: result});

				if (!!self.state.token.name && !!self.state.token.email) {
					self.setButtonState(true);
				} else {
					self.setButtonState(false);
				}
			});
		}).end(JSON.stringify({
			"token": params.token,
		}));
	},

	render: function() {
		var params = this.getParams();
		var query  = this.getQuery();

		return (
			<div className="create">
				<h2>
					Please type in your alternative e-mail address<br/>
					and choose a username for your account
				</h2>

				<form onSubmit={this.handleSubmit}>
					<input ref="username" type="text" placeholder="username"
						maxLength="32" onInput={this.usernameChange}
						onPropertyChange={this.usernameChange}
						value={this.state.token.name}
						readOnly={!!this.state.token.name} />
					<input ref="email" type="email" maxLength="32"
						placeholder="alternative e-mail address"
						onInput={this.emailChange}
						onPropertyChange={this.emailChange}
						value={this.state.token.email}
						readOnly={!!this.state.token.email} />
					<button ref="submit" type="submit" disabled>
						Next step
					</button>
				</form>
			</div>
		)
	}
});