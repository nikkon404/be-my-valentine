const express = require('express');
const path = require('path');
const config = require('./config');
const { applySecurity } = require('./middleware/security');
const apiRoutes = require('./routes/api');
const { ensureCsv } = require('./lib/csv');

const app = express();

app.set('trust proxy', 1);

app.use(express.json({ limit: '1kb' }));
applySecurity(app);
app.use(express.static(__dirname));

app.use('/api', apiRoutes);

const host = process.env.HOST || '0.0.0.0';
app.listen(config.PORT, host, () => {
  ensureCsv();
  console.log('Valentines server listening on', host + ':' + config.PORT);
});
