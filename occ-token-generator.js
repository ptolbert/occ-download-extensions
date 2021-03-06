/*
 * Copyright (c) 2018 LEEDIUM.
 * This file is subject to the terms and conditions
 * defined in file 'LICENSE.txt', which is part of this
 * source code package.
 */

/**
 * @project occ-token-generator
 * @file token.js
 * @company LEEDIUM
 * @createdBy davidlee
 * @contact david@leedium.com
 * @dateCreated 11/20/2018
 * @description  Generates an OCC token and refreshes every -n seconds
 **/

const axios = require("axios");

const HTTPS_PREFIX = "https://";

let tokens = {};
let inited = false;


/**
 * Api call to login and generate admin access tokens
 * @param adminServer
 * @param token
 * @param refresh
 * @returns {*}
 */
const loginToOCCWithAppKey = (adminServer, token) => {

    return axios({
        method: "POST",
        url: `${adminServer}/ccadmin/v1/login`,
        responseType: "json",
        params: {
            "grant_type": "client_credentials"
        },
        headers: {
            "Authorization": `Bearer ${token}`,
            "content-type": "application/x-www-form-urlencoded"
        }
    });
};

/**
 * Authenticatws with a username and password
 * @param adminServer
 * @param password
 * @param username
 * @returns {*}
 */
const loginToOCCAsUser = (adminServer, {password, username}) => {
    return axios({
        method: "POST",
        url: `${adminServer}/ccadmin/v1/login`,
        responseType: "json",
        params: {
            "grant_type": "password",
            "password": password,
            "username": username

        },
        headers: {
            "content-type": "application/x-www-form-urlencoded"
        }
    });
};

/**
 * Starts the tire to generate an access token
 * @param server
 * @param token
 * @param refresh
 */
const generateToken = async (server, authObj, userLogin = false) => {
    return new Promise((resolve, reject) => {
        server.indexOf(HTTPS_PREFIX) !== 0 ? `${HTTPS_PREFIX}${server}` : server;
        const req = function ({data}) {
            //  store the token(s) in a hash
            tokens[server] = data.access_token;
            resolve(data.access_token);
        };
        if(userLogin){
            loginToOCCAsUser(server, authObj)
                .then((res) => {
                    req(res);
                })
                .catch(reject);
        }else{
            loginToOCCWithAppKey(server, authObj)
                .then((res) => {
                    req(res);
                })
                .catch(reject);
        }
    });
};

/**
 * Returns the currently saved token
 * @returns {*}
 */
const getCurrentToken = (server) => tokens[server];
module.exports = {
    generateToken,
    getCurrentToken
};

