const appRoot = require('app-root-path');
const express = require('express');
const router = express.Router();
const fs = require('fs');

// loop through interfaces to append API
fs.readdir(`${appRoot}/interfaces`, function (err, folders) {
    if (err) {
        console.error("Could not list the directory.", err);
    }
    folders.forEach(function (folder, index) {
        try {
            console.log(`${appRoot}/interfaces/${folder}/post`);
            router.post('/api/'+folder, require(`${appRoot}/interfaces/${folder}/post/index`));
            console.log('added /api/'+folder);
        }
        catch (e) {
            console.log('unable to add /api/'+folder);
            console.log(e);
        }
    });
});

module.exports = router;