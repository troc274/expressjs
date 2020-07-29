var amqp = require("amqp-connection-manager");

var QUEUE_NAME = "TestRabbitMQ";

// Create a connetion manager
var connection = amqp.connect(["amqp://localhost"]);
connection.on("connect", function() {
  console.log("Connected!");
});
connection.on("disconnect", function(err) {
  console.log("Disconnected.", err.stack);
});

// Create a channel wrapper
var channelWrapper = connection.createChannel({
  json: true,
  setup: function(channel) {
    // `channel` here is a regular amqplib `ConfirmChannel`.
    return channel.assertQueue(QUEUE_NAME, { durable: true });
  }
});

// Send messages until someone hits CTRL-C or something goes wrong...
var sendMessage = function(message) {
  channelWrapper
    .sendToQueue(QUEUE_NAME, {
      message: message,
      time: Date.now()
    })
    .then(function() {
      console.log("Message sent");
    })
    .then(function() {
      return sendMessage("cua ba be");
    })
    .catch(function(err) {
      console.log("Message was rejected:", err.stack);
      channelWrapper.close();
      connection.close();
    });
};

console.log("Sending messages...");
sendMessage("cua ba be");
