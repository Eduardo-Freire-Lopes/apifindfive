const mongoose = require('mongoose')
const PalavrasSchema = mongoose.Schema(
    {
        name:{
            type: String,
            required: [true, "please enter name"]
        }
    },
    {
        timestamps: true 
    }
)
const Palavras = mongoose.model('Palavras', PalavrasSchema);

module.exports = Palavras;