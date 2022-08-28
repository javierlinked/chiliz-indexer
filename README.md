Instructions

Installation

yarn
cp .env.example .env
set your the variable INFURA_KEY with the key obtained in Infura.
yarn start

Use

Open a browser and navigate to:
- http://localhost:3000/totals
returns a JSON object with stats including the total ammount of CHZ trasfered since program started.

- http://localhost:3000/transaction/:id
validates if a transaction hash (:id) belongs to an operation with CHZ or not.