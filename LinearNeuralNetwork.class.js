function LinearNeuralNetworkNeuron(order, connections) {
    this.order = order; // Remember own order so we don't fetch from neurons without a value by mistake
    this.inputs = [];
    this.output = 0.0;
    this.value = Math.random() * 4.0 - 2.0;
    if(this.value < 0) this.value = 0;
    if(this.value > 1) this.value = 1;
    
    // Set inputs
    for(var i = 0; i < connections; i++) {
        this.inputs[i] = {
            'source': Math.floor(Math.random() * order), // ID for source neuron
            'minimum': Math.random() * 2.0 - 1.0,
            'maximum': 0,
            'weight': Math.random() * 4.0 - 2.0,
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
LinearNeuralNetworkNeuron.prototype.mutate = function() {
    var i = Math.floor(Math.random() * this.inputs.length) + 1;
    if(i == this.inputs.length) {
        this.value += Math.random() * 2.0 - 1.0;
        if(this.value < 0) this.value = 0;
        if(this.value > 1) this.value = 1;
    } else switch(Math.floor(Math.random() * 5.0)) {
    case 0: this.inputs[i].source = Math.floor(Math.random() * this.order); break;
    case 1:
        this.inputs[i].minimum += Math.random() * 2.0 - 1.0;
        if(this.inputs[i].minimum < 0) this.inputs[i].minimum = 0;
        if(this.inputs[i].minimum > this.inputs[i].maximum) this.inputs[i].minimum = Math.random() * this.inputs[i].maximum;
        break;
    case 2:
        this.inputs[i].maximum += Math.random() * 2.0 - 1.0;
        if(this.inputs[i].maximum > 1) this.inputs[i].maximum = 1;
        if(this.inputs[i].minimum > this.inputs[i].maximum) this.inputs[i].maximum = this.inputs[i].minimum + Math.random() * (1.0 - this.inputs[i].minimum);
        break;
    case 3:
        this.inputs[i].weight += Math.random() * 4.0 - 2.0;
        if(this.inputs[i].weight < -2) this.inputs[i].weight = -2;
        if(this.inputs[i].weight > 2) this.inputs[i].weight = 2;
        break;
    case 4:
        this.inputs[i].offset += Math.random() * 2.0 - 1.0;
        if(this.inputs[i].weight < -1) this.inputs[i].weight = -1;
        if(this.inputs[i].weight > 1) this.inputs[i].weight = 1;
        break;
    }
}

function LinearNeuralNetwork(neurons, connections, outputs) {
    this.outputs = outputs; // Number of values returned as output values
    this.n = []; // Neurons
    
    // Populate neurons
    for(var i = 0; i < neurons; i++) {
        this.n[i] = new LinearNeuralNetworkNeuron(i, connections);
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
LinearNeuralNetwork.prototype.mutate = function(amount) {
    var x = 0;
    for(var i = 0; i < amount; i++) {
        this.n[Math.floor(Math.random() * this.n.length)].mutate();
    }
}

// Export neural network as string
LinearNeuralNetwork.prototype.export = function() {
    var data = [
        "LNN0.2",
        this.outputs
    ];
    for(var i = 0; i < this.n.length; i++) {
        data.push(this.n[i].export());
    }
    return data.join(":");
}

// Import neural network from string
LinearNeuralNetwork.prototype.import = function(str) {
    if(str.substr(0, 7) !== "LNN0.2:") return false;
    var data = str.split("N:");
    data[0] = data[0].split(":");
    this.outputs = parseInt(data[0][1], 10);
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

/*
function LinearNeuralNetwork(neurons, connections, inputs, outputs, max_in, max_out) {
    this.max_in = max_in; // Input to a neuron is cropped to this threshold
    this.max_out = max_out; // Output from a neuron is cropped to this threshold
    this.inputs = inputs; // Number of neurons reserved for input values, doing no calculations
    this.outputs = outputs; // Number of values returned as output values
    this.connections = connections; // Number of neurons any neuron takes input values from
    this.n = []; // Neurons
    
    // Populate neurons
    for(var i = 0; i < neurons; i++) {
        this.n[i] = {
            'output': 0,
            'inputs': []
        };
        
        // Connect neurons
        if(i >= inputs) for(var u = 0; u < connections; u++) if(u <= i) {
            this.n[i].inputs[u] = {
                'ref': Math.floor(Math.random() * i), // Does it matter if a neuron may take the same input more than once?
                'weight': Math.random() * 2.0 - 1.0,
                'offset': Math.random() * 2.0 - 1.0,
                'method': Math.random() * 2.0 // 0-1: in*weight, 1-2: in/weight
            };
        }
    }
}

// Generate output from input (think)
LinearNeuralNetwork.prototype.think = function(input_values) {
    
    // Populate the input neurons
    for(var i = 0; i < input_values.length; i++) if(i < this.n.length) {
        this.n[i].output = input_values[i];
        if(this.n[i].output < 0 - this.max_out) this.n[i].output = 0 - this.max_out;
        else if(this.n[i].output > this.max_out) this.n[i].output = this.max_out;
    }
    
    // Loop through rest of neurons
    for(var i = this.inputs; i < this.n.length; i++) {
        this.n[i].output = 0; // Reset the result
        
        // Get input values for neuron
        for(var u = 0; u < this.n[i].inputs.length; u++) {
            this.tmp_input = this.n[this.n[i].inputs[u].ref].output + this.n[i].inputs[u].offset * this.max_in;
            if(this.n[i].inputs[u].method < 1) this.tmp_input = this.tmp_input * this.n[i].inputs[u].weight; // Weight down input values
            else if(Math.abs(this.n[i].inputs[u].weight) < 0.000001) this.tmp_input = this.max_in; // Avoid division by zero
            else this.tmp_input = this.tmp_input / this.n[i].inputs[u].weight; // Weight up input values
            
            // Sanitize input values and add to output
            if(this.tmp_input < 0 - this.max_in) this.tmp_input = 0 - this.max_in;
            else if(this.tmp_input > this.max_in) this.tmp_input = this.max_in;
            this.n[i].output += this.tmp_input;
        }
        
        // Sanitize output values
        if(this.n[i].output < 0 - this.max_out) this.n[i].output = 0 - this.max_out;
        else if(this.n[i].output > this.max_out) this.n[i].output = this.max_out;
    }
    
    // Return the result
    var res = [];
    for(var i = this.n.length - this.outputs; i < this.n.length; i++) if(i >= 0) {
        res.push(this.n[i].output);
    }
    return res;
}

// Mutate the neurons
LinearNeuralNetwork.prototype.mutate = function(amount) {
    var a, b;
    for(var i = 0; i < amount; i++) {
        
        // Neuron to mutate
        var a = Math.floor(Math.random() * (this.n.length - this.inputs)) + this.inputs;
        
        // Input to mutate
        var b =  Math.floor(Math.random() * this.n[a].inputs.length);
        switch(Math.floor(Math.random() * 4)) {
        
        // Mutate input source
        case 0: this.n[a].inputs[b].ref = Math.floor(Math.random() * a); break;
        
        // Mutate input weight
        case 1: this.n[a].inputs[b].weight = Math.random() * 2.0 - 1.0; break;
        
        // Mutate input offset
        case 2: this.n[a].inputs[b].offset = Math.random() * 2.0 - 1.0; break;
        
        // Mutate input handling method
        case 3: this.n[a].inputs[b].method = Math.random() * 2.0; break;
        }
    }
}

// Export neural network as string
LinearNeuralNetwork.prototype.export = function() {
    var data = [
        "LNN",
        this.max_in,
        this.max_out,
        this.inputs,
        this.outputs,
        this.connections
    ];
    for(var i = 0; i < this.n.length; i++) {
        data.push("N");
        for(var u = 0; u < this.n[i].inputs.length; u++) {
            data.push("I");
            data.push(this.n[i].inputs[u].ref);
            data.push(this.n[i].inputs[u].weight);
            data.push(this.n[i].inputs[u].offset);
            data.push(this.n[i].inputs[u].method);
        }
    }
    return data.join(":");
}

// Import neural network from string
LinearNeuralNetwork.prototype.import = function(str) {
    var data = str.split(':');
    if(data[0] != "LNN") return false;
    this.max_in = parseFloat(data[1]);
    this.max_out = parseFloat(data[2]);
    this.inputs = parseInt(data[3], 10);
    this.outputs = parseInt(data[4], 10);
    this.connections = parseInt(data[5], 10);
    this.n = [];
    var cur_n = -1;
    var cur_i = -1;
    var cur_p = -1;
    for(var i = 6; i < data.length; i++) {
        if(data[i] == "N") {
            cur_n++;
            this.n[cur_n] = {
                'output': 0,
                'inputs': []
            };
            cur_i = -1;
            continue;
        } else if(data[i] == "I") {
            cur_i++;
            cur_p = "ref";
            this.n[cur_n].inputs[cur_i] = {
                'ref': 0,
                'weight': 0,
                'offset': 0,
                'method': 0
            };
            continue;
        } else if(cur_p == 'ref') {
            this.n[cur_n].inputs[cur_i][cur_p] = parseInt(data[i], 10);
            cur_p = 'weight';
        } else if(cur_p == 'weight') {
            this.n[cur_n].inputs[cur_i][cur_p] = parseFloat(data[i]);
            cur_p = 'offset';
        } else if(cur_p == 'offset') {
            this.n[cur_n].inputs[cur_i][cur_p] = parseFloat(data[i]);
            cur_p = 'method';
        } else if(cur_p == 'method') {
            this.n[cur_n].inputs[cur_i][cur_p] = parseFloat(data[i]);
            cur_p = 'done';
        } else {
            return false;
        }
    }
    return true;
}
*/