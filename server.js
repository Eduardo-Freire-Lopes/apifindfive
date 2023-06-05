require('dotenv').config()
const jwt = require('jsonwebtoken')
const express = require('express')
const mongoose = require('mongoose')
const Palavras = require('./models/palavraModel');
const Partida = require('./models/partidaModel');
const axios = require('axios');
const app = express()
const port = 3000
const cors = require('cors')
app.use(express.json())
app.use(cors({
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.get('/', (req, res) => {
  res.send('vazio aqui!')
})  

//get todos os produtos

app.get('/palavras', async(req,res) => {
    try {
        const palavra = await Palavras.find({});
        res.status(200).json(palavra)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})


//get random
app.get('/palavras/randomWord', async (req, res) => {
    try {
      const count = await Palavras.countDocuments();
      const randomWord = Math.floor(Math.random() * count);
      const palavra = await Palavras.findOne().skip(randomWord);
      res.status(200).json(palavra);
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  });

//get pelo ID
app.get('/palavras/:id', async(req,res) =>{
    try {
        const {id} = req.params;
        const palavra = await Palavras.findById(id);
        res.status(200).json(palavra)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

//update
app.put('/palavras/:id', async(req,res) =>{
    try{
        const {id} = req.params;
        const palavra = await Palavras.findByIdAndUpdate(id, req.body);
        //nao achou
        if(!palavra){
            return res.status(404).json({message: `cannot find it with this ID ${id}`})
        }
        const updatedProduct = await Palavras.findById(id);
        res.status(200).json(updatedProduct);
        
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

//postar
app.post('/palavras', async(req,res) => {
    try {
        const palavra = await Palavras.create(req.body)
        res.status(200).json(palavra);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
})

//delete byID
app.delete('/palavras/:id', async(req,res) => {
    try {
        const {id} = req.params;
        const palavra = await Palavras.findByIdAndDelete(id);
        if(!palavra){
            return res.status(404).json({message: `cant find a palavra with ID: ${id}`})
        }
        res.status(200).json(palavra);
    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

//ROTAS: PARTIDA

//getById
app.get('/partida', async(req,res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.status(401).json({msg: "Acesso Negado!"});

    try {
        const secret = process.env.SECRET;

        const payload = jwt.verify(token, secret);

        const partida = await Partida.findOne({id_usuario: payload._id}).select('-id_usuario');

        if(!partida){
            return res.status(402).json({msg: "Esse usuário não tem partida!"})
        }
        return res.status(200).json(partida)
    }
    catch (erro){
        return res.status(400).json({msg: "Token inválido!"})
    }
})

//partida POST
app.post('/partida', async(req,res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    
    if(!token) return res.status(401).json({msg: "Acesso Negado!"});

    try {
        const secret = process.env.SECRET;

        const payload = jwt.verify(token, secret);
        const partidaCheck = await Partida.findOne({id_usuario: payload._id})

        if(partidaCheck){
            return res.status(402).json({msg: "Já existe essa partida!"})
        }

        try {
            const response = await axios.get('http://localhost:3036/palavras/randomWord');
            
            const partida = new Partida({
                id_usuario: payload._id,
                palavra_sorteada: response.data.name,
                tentativas_palavras: [],
                tentativas_estados: []
            })
            try {
                await partida.save();

                const resPartida = partida.toObject();
                delete resPartida.id_usuario;

                return res.status(200).json(resPartida);
            } catch (error) {
                
            }
    
          } catch (error) {
            // Lidar com erros
            console.error('Erro na chamada da API:', error);
          }

    }
    catch (erro){
        return res.status(400).json({msg: "Token inválido!", token:token})
    }
});

//Partida Delete
app.delete('/partida', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) res.status(401).json({ msg: "Acesso Negado!" });
  
    try {
      const secret = process.env.SECRET;
  
      const payload = jwt.verify(token, secret);
  
      const partida = await Partida.findOneAndDelete({ id_usuario: payload._id });
      if (!partida) {
        return res.status(404).json({ msg: "Partida não encontrada!" });
      }
  
      return res.status(200).json({ msg: "Partida removida com sucesso!" });
    } catch (erro) {
      return res.status(400).json({ msg: "Token inválido!", token: token });
    }
});

//atualizar partida
app.put('/partida', async(req,res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.status(401).json({msg: "Acesso Negado!"});

    const {palavra, estates} = req.body.data

    try {
        const secret = process.env.SECRET;

        const payload = jwt.verify(token, secret);

        const partida = await Partida.findOne({id_usuario: payload._id}).select('-id_usuario');

        if(!partida){
            return res.status(402).json({msg: "Esse usuário não tem partida!"})
        }

        partida.tentativas_palavras.push(palavra);
        partida.tentativas_estados.push(estates);

        await partida.save();

        return res.status(200).json(partida)
    }
    catch (erro){
        return res.status(400).json({msg: "Token inválido!"})
    }
})

mongoose.set("strictQuery", false)
mongoose.
connect('mongodb+srv://admin:elohkcalbHero17@devtaminapi.lxpk4hy.mongodb.net/Node-API?retryWrites=true&w=majority')
.then(() => {
    console.log("conectou ao mongoDB")
    app.listen(port, () => {
        console.log(`escutei! ${port}`)
      })  
}).catch((error) => {
    console.log(error)
})
