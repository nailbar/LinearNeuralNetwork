function LinearNeuralNetworkNeuron(order, connections, passive) {
    this.order = order; // Remember own order so we don't fetch from neurons without a value by mistake
    this.inputs = [];
    this.output = 0.0;
    this.value = Math.random() * 2.0 - 1.0;
    if(this.value < 0) this.value = 0;
    if(this.value > 1) this.value = 1;
    
    // Set inputs
    if(!passive) for(var i = 0; i < connections; i++) {
        this.inputs[i] = {
            'source': Math.floor(Math.random() * order), // ID for source neuron
            'minimum': Math.random() * 2.0 - 1.0,
            'maximum': 0,
            'weight': Math.random() * 2.0 - 1.0,
            'offset': Math.random() * 2.0 - 1.0
        }
        if(this.inputs[i].minimum < 0) this.inputs[i].minimum = 0;
        this.inputs[i].maximum = this.inputs[i].minimum + Math.random() * 2.0;
        if(this.inputs[i].maximum > 1) this.inputs[i].maximum = 1;
    }
}

// Crop neuron output to between 0 and 1
LinearNeuralNetworkNeuron.prototype.crop = function(value) {
    if(value < 0) return 0;
    if(value > 1) return 1;
    return value;
}

// Generate output from input for one neuron
LinearNeuralNetworkNeuron.prototype.think = function(neurons) {
    this.output = this.value;
    var inputvalue = 0;
    for(var i = 0; i < this.inputs.length; i++) {
        inputvalue = neurons[this.inputs[i].source].output;
        if(inputvalue >= this.inputs[i].minimum && inputvalue <= this.inputs[i].maximum) {
            inputvalue -= this.inputs[i].minimum;
            inputvalue *= 1 / (this.inputs[i].maximum - this.inputs[i].minimum);
            this.output += this.inputs[i].offset + inputvalue * this.inputs[i].weight;
        }
    }
    this.output = this.crop(this.output);
}

// Export a single neuron as string
LinearNeuralNetworkNeuron.prototype.export = function() {
    var data = [
        "N",
        this.order,
        this.value
    ];
    for(var i = 0; i < this.inputs.length; i++) {
        data.push("I");
        data.push(this.inputs[i].source);
        data.push(this.inputs[i].minimum);
        data.push(this.inputs[i].maximum);
        data.push(this.inputs[i].weight);
        data.push(this.inputs[i].offset);
    }
    return data.join(":");
}

// Import a single neuron from string
LinearNeuralNetworkNeuron.prototype.import = function(str) {
    var data = str.split("I:");
    data[0] = data[0].split(":");
    this.order = parseInt(data[0][0], 10);
    this.value = parseFloat(data[0][1]);
    for(var i = 1; i < data.length; i++) {
        data[i] = data[i].split(":");
        this.inputs.push({
            'source': parseInt(data[i][0], 10), // ID for source neuron
            'minimum': parseFloat(data[i][1]),
            'maximum': parseFloat(data[i][2]),
            'weight': parseFloat(data[i][3]),
            'offset': parseFloat(data[i][4])
        });
    }
    return true;
}

// Mutate part of a single neuron
LinearNeuralNetworkNeuron.prototype.mutate = function(amount) {
    if(!amount) amount = 1.0;
    var i = Math.floor(Math.random() * this.inputs.length) + 1;
    if(i == this.inputs.length || this.inputs.length == 0) {
        this.value += (Math.random() * 2.0 - 1.0) * amount;
        if(this.value < 0) this.value = 0;
        if(this.value > 1) this.value = 1;
    } else switch(Math.floor(Math.random() * 5.0)) {
    case 0: this.inputs[i].source = Math.floor(Math.random() * this.order); break;
    case 1:
        this.inputs[i].minimum += (Math.random() * 2.0 - 1.0) * amount;
        if(this.inputs[i].minimum < 0) this.inputs[i].minimum = 0;
        if(this.inputs[i].minimum > this.inputs[i].maximum) this.inputs[i].minimum = Math.random() * this.inputs[i].maximum;
        break;
    case 2:
        this.inputs[i].maximum += (Math.random() * 2.0 - 1.0) * amount;
        if(this.inputs[i].maximum > 1) this.inputs[i].maximum = 1;
        if(this.inputs[i].minimum > this.inputs[i].maximum) this.inputs[i].maximum = this.inputs[i].minimum + Math.random() * (1.0 - this.inputs[i].minimum);
        break;
    case 3:
        this.inputs[i].weight += (Math.random() * 2.0 - 1.0) * amount;
        if(this.inputs[i].weight < -1) this.inputs[i].weight = -1;
        if(this.inputs[i].weight > 1) this.inputs[i].weight = 1;
        break;
    case 4:
        this.inputs[i].offset += (Math.random() * 2.0 - 1.0) * amount;
        if(this.inputs[i].weight < -1) this.inputs[i].weight = -1;
        if(this.inputs[i].weight > 1) this.inputs[i].weight = 1;
        break;
    }
}

function LinearNeuralNetwork(neurons, connections, outputs, inputs) {
    this.outputs = outputs; // Number of values returned as output values
    this.inputs = inputs; // Number of passive neurons (usually reserved for setting input values)
    this.n = []; // Neurons
    
    // Populate neurons
    for(var i = 0; i < neurons; i++) {
        this.n[i] = new LinearNeuralNetworkNeuron(i, connections, i < inputs);
    }
}

// Generate output from input
LinearNeuralNetwork.prototype.think = function(inputs) {
    
    // Start by setting input values
    for(var i = 0; i < inputs.length; i++) {
        this.n[i].output = this.n[i].crop(inputs[i]);
    }
    
    // Loop through the rest of the neurons
    for(var i = inputs.length; i < this.n.length; i++) {
        this.n[i].think(this.n);
    }
    
    // Return array with output values
    var output = [];
    for(var i = 0; i < this.outputs; i++) {
        output[i] = this.n[this.n.length - i - 1].output;
    }
    return output;
}

// Mutate a neural network
LinearNeuralNetwork.prototype.mutate = function(times, amount) {
    var x = 0;
    for(var i = 0; i < times; i++) {
        this.n[Math.floor(Math.random() * (this.n.length - 1)) + 1].mutate(amount);
    }
}

// Export neural network as string
LinearNeuralNetwork.prototype.export = function() {
    var data = [
        "LNN0.3",
        this.outputs,
        this.inputs
    ];
    for(var i = 0; i < this.n.length; i++) {
        data.push(this.n[i].export());
    }
    return data.join(":");
}

// Import neural network from string
LinearNeuralNetwork.prototype.import = function(str) {
    if(str.substr(0, 7) !== "LNN0.3:") return false;
    var data = str.split("N:");
    data[0] = data[0].split(":");
    this.outputs = parseInt(data[0][1], 10);
    this.inputs = parseInt(data[0][1], 10);
    this.n = [];
    for(var i = 1; i < data.length; i++) {
        this.n[i - 1] = new LinearNeuralNetworkNeuron(i - 1, 0);
        if(!this.n[i - 1].import(data[i])) return false;
    }
    return true;
}

LinearNeuralNetwork.prototype.normalize = function(value, optimal_range, negative_range) {
    if(!optimal_range) optimal_range = 1.0;
    if(value > 0) value = 1 - 1 / (1 + value / (optimal_range * 0.2));
    if(!negative_range) {
        if(value < 0) return 0;
        return value;
    }
    if(value < 0) value = -1 - 1 / (-1 + value / (negative_range * 0.2));
    return value * 0.5 + 0.5;
}
