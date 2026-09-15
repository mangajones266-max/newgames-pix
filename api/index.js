const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

app.post('/criar-pix', async (req, res) => {
    try {
        const { valor, titulo } = req.body;

        const payment = new Payment(client);

        const resultado = await payment.create({
            body: {
                transaction_amount: parseFloat(valor),
                description: titulo,
                payment_method_id: 'pix',
                payer: {
                    email: 'cliente@newgames.com'
                }
            }
        });

        res.json({
            sucesso: true,
            qr_code: resultado.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: resultado.point_of_interaction.transaction_data.qr_code_base64,
            id_pagamento: resultado.id
        });

    } catch (erro) {
        res.status(500).json({
            sucesso: false,
            erro: erro.message
        });
    }
});

app.post('/webhook', async (req, res) => {
    try {
        const { data } = req.body;

        if (data && data.id) {
            const payment = new Payment(client);
            const infoPagamento = await payment.get({ id: data.id });

            if (infoPagamento.status === 'approved') {
                console.log('Pagamento aprovado:', infoPagamento.id);
            }
        }

        res.status(200).send('OK');

    } catch (erro) {
        res.status(500).send('Erro');
    }
});

app.get('/', (req, res) => {
    res.send('Servidor NewGames PIX rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Servidor rodando na porta ' + PORT);
});
