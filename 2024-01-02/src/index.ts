const express = require('express');
const moduleAlias = require('module-alias');
// ts path alias

moduleAlias.addAliases({
    '@root': __dirname,
    '@db': __dirname + '/db',
    '@lib': __dirname + '/lib',
    '@route': __dirname + '/server/routes',
    '@server': __dirname + '/server',
});

require('dotenv').config();

const routes = require('@route/index');

const initExpressApp = require('@server/initExpressApp');
const dbConnect = require('@db/connect');

const initConnection = async () => {

    const app = express();
    const port = process.env.PORT;

    await dbConnect();

    initExpressApp(app);

    routes.forEach(route => {
        app[route.method](route.path, (req, res) => {
            route.handler(req, res)
                .catch((err) => {
                    console.error('Api Error', err);

                    const [statusCode, errorMessage] = err.message.split(':');

                    return res.status(statusCode).json({ 
                        success: false, 
                        message: errorMessage,
                    });
                });
        });
    });
    
    app.listen(port, () => {
        console.log(`Server is Running in ${port}`);
    });
}

initConnection()
    .catch((err) => {
        console.error('Error is occured while running application. Error: ', err);
    });

