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
