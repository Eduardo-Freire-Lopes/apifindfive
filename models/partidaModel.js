const mongoose = require('mongoose')
const PartidaSchema = mongoose.Schema(
    {
        tentativas_estados:{
            type: Array
        },
        tentativas_palavras:{
            type: Array
        },
        palavra_sorteada:{
            type: String
        },
        id_usuario:{
            type: String
        }
    },
    {
        timestamps: false 
    }
)
const Partida = mongoose.model('Partida', PartidaSchema);

module.exports = Partida;