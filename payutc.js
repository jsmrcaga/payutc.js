// *****************************************************************************
// The MIT License (MIT)

// Copyright (c) 2015-2016
// Jo Colina - @jsmrcaga
// Updated in 2018 by Cesar Richard - @cesar-richard

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// *****************************************************************************
const http = require('https');

const payutcAPI = {
	config: {
		url: 'api.nemopay.net',
		username: 'username',
		password: 'password',
		systemID: 'payutc',
		async: false,
		app_key: '',
		fun_id: 2,
		sessionID: 0,
		logged_usr: '',
		loginMethod: 'payuser',
		date: new Date(),
		debug: false
	},

	genericApiCall(service, method, data, callback) {
		let response = '';
		let url = `/services/${service}/${method}?system_id=${this.config.systemID}&app_key=${this.config.app_key}`;

		if (this.config.sessionID) {
			url += `&sessionid=${this.config.sessionID}`;
		}

		const options = {
			hostname: this.config.url,
			path: url,
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			}
		};

		const request = http.request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
				// console.log('Body: ' + chunk);
				response += chunk;
			});

			res.on('end', function() {
				if (callback) callback(response);
			});
		});

		request.on('error', function(e) {
			throw new Error(`Error whith request: ${e.message}`);
			// console.warn('Error with request: ', e);
		});

		if (typeof data !== 'undefined') {
			options.headers = {
				'Content-type': 'application/json'
			};
			request.write(JSON.stringify(data)); // session_id: this.sessionID
			request.end();
		} else {
			request.end();
		}
		// console.log("URL Sent: ", url);
		// console.log("Data sent: ", String(data));
		// console.log("ResponseText: ", xml.responseText);
	},

	genericApiResourcesCall(method, service, objId, data, callback) {
		let response = '';
		let url = `/resources/${service}/${objId}?system_id=${this.config.systemID}&app_key=${this.config.app_key}`;

		if (this.config.sessionID) {
			url += `&sessionid=${this.config.sessionID}`;
		}

		const options = {
			hostname: this.config.url,
			path: url,
			method,
			headers: {
				'Content-type': 'application/json',
				'nemopay-version': '2018-07-03'
			}
		};

		const request = http.request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function(chunk) {
				response += chunk;
			});

			res.on('end', function() {
				if (callback) callback(response);
			});
		});

		request.on('error', function(e) {
			throw new Error(`Error whith request: ${e.message}`);
		});

		if (typeof data !== 'undefined') {
			options.headers = {
				'Content-type': 'application/json'
			};
			request.write(JSON.stringify(data)); // session_id: this.sessionID
			request.end();
		} else {
			request.end();
		}
	}
};

// This is the object that will contain all services
// and all methods in payutc's api.
// ex: payutc.stats.getNbSell(obj_id);
module.exports = {
	init(params) {
		/* params = {
				endpoint,
				u_name,
				p_word,
				sys_id,
				fun_id
			} */
		if (
			typeof params === 'undefined' ||
			typeof params.endpoint === 'undefined' ||
			typeof params.u_name === 'undefined' ||
			typeof params.p_word === 'undefined' ||
			typeof params.sys_id === 'undefined' ||
			typeof params.fun_id === 'undefined' ||
			typeof params.app_key === 'undefined'
		) {
			// throw new Error("params{}, .endpoint, .u_name, .p_word, .sys_id and .fun_id are required");
		}

		payutcAPI.config.url = params.endpoint;
		payutcAPI.config.username = params.u_name;
		payutcAPI.config.password = params.p_word;
		payutcAPI.config.systemID = params.sys_id;
		payutcAPI.config.fun_id = params.fun_id;
		payutcAPI.config.app_key = params.app_key;
	},

	config: {
		// use to make setter functions
		// to modify payutcAPI config
		debug(act) {
			if (act === 'on' || typeof act === 'undefined') {
				payutcAPI.config.debug = true;
			} else if (act === 'off') {
				payutcAPI.config.debug = false;
			}
		},

		setUrl(url) {
			if (typeof url === 'undefined') throw new Error('url is required for payutc.config.setUrl');
			payutcAPI.config.url = url;
		},

		setUID(username, password) {
			if (typeof username === 'undefined' || typeof password === 'undefined') {
				throw new Error('(username,password) are required for payutc.config.setUID');
			}
			payutcAPI.config.username = username;
			payutcAPI.config.password = password;
		},

		setSysId(sysId) {
			if (typeof sysId === 'undefined') {
				throw new Error('sysId is required for payutc.config.setSysId');
			}
			payutcAPI.config.systemID = sysId;
		},

		setAppKey(appKey) {
			if (typeof appKey === 'undefined') {
				throw new Error('appKey is required for payutc.config.setAppKey');
			}

			payutcAPI.config.app_key = appKey;
		},

		isAsync(async) {
			if (typeof async === 'undefined') {
				throw new Error('async is required for payutc.config.isAsync');
			}
			payutcAPI.config.async = async;
		},

		setFundation(funId) {
			if (typeof funId === 'undefined') {
				throw new Error('funId is required for payutc.config.setFundation');
			}
			payutcAPI.config.fun_id = funId;
		}
	},

	login: {
		cas(params) {
			// var params = {service, ticket}
			return payutcAPI.genericApiCall('GESARTICLE', 'loginCas2', { service: params.service, ticket: params.ticket }, function(data) {
				const resp = JSON.parse(data);

				if (typeof resp.sessionid !== 'undefined') {
					payutcAPI.config.sessionID = resp.sessionid;
					payutcAPI.config.logged_usr = resp.username;
					console.log('Logged user successfully:', payutcAPI.config.logged_usr); // eslint-disable-line no-console
				} else {
					console.log(`Invalid login, error: ${resp.error.type} (${resp.error.code}) :${resp.error.message}`); // eslint-disable-line no-console
				}
        
				let result = 0;
				if (typeof resp.sessionid !== 'undefined') {
					result = 1;
				} else {
					result = 0;
				}

				if (params.callback) params.callback(result, data);

				return result;
			});
		},

		payuser(params) {
			// var params = {login, password}
			payutcAPI.genericApiCall('GESARTICLE', 'login2', { login: params.login, password: params.password }, function(data) {
				const resp = JSON.parse(data);

				if (typeof resp.sessionid !== 'undefined') {
					payutcAPI.config.sessionID = resp.sessionid;
					payutcAPI.config.logged_usr = resp.username;
					console.log('Logged user successfully:', payutcAPI.config.logged_usr); // eslint-disable-line no-console
				} else {
					console.log(`Invalid login, error: ${resp.error}`); // eslint-disable-line no-console
				}

				let result = 0;

				if (typeof resp.sessionid !== 'undefined') {
					result = 1;
				} else {
					result = 0;
				}

				if (params.callback) params.callback(result, data);
			});
		},

		badge(params) {
			// var params = {badge_id, pin}
			return payutcAPI.genericApiCall('POSS3', 'loginBadge2', { badge_id: params.badge_id, pin: params.pin }, function(data) {
				const resp = JSON.parse(data);

				if (typeof resp.sessionid !== 'undefined') {
					payutcAPI.config.sessionID = resp.sessionid;
					payutcAPI.config.logged_usr = resp.username;
					console.log('Logged user successfully:', payutcAPI.config.logged_usr); // eslint-disable-line no-console
				} else {
					console.log(`Invalid login, error: ${resp.error.type} (${resp.error.code}) :${resp.error.message}`); // eslint-disable-line no-console
				}

				if (params.callback) params.callback(data);

				if (typeof resp.sessionid !== 'undefined') {
					return 1;
				} else {
					return 0;
				}
			});
		},

		payuser_default() {
			payutcAPI.genericApiCall('GESARTICLE', 'login2', { login: payutcAPI.config.username, password: payutcAPI.config.password }, function(
				data
			) {
				const resp = JSON.parse(data);

				if (typeof resp.sessionid !== 'undefined') {
					payutcAPI.config.sessionID = resp.sessionid;
					payutcAPI.config.logged_usr = resp.username;
					console.log('Logged user successfully:', payutcAPI.config.logged_usr); // eslint-disable-line no-console
				}

				if (typeof resp.sessionid !== 'undefined') {
					return 1;
				} else {
					return 0;
				}
			});
		}
	},

	stats: {
		getSalesEvolution(params) {
			// var params = {objId, funId, start, end, tick};
			return payutcAPI.genericApiCall(
				'TRESO',
				'getSalesEvolution',
				{
					group_by: ['row__item_id'],
					fun_id: params.funId,
					start: params.start,
					end: params.end || payutcAPI.config.date.toISOString(),
					event_id: 1
				},
				params.callback
			);
		},

		getNbSell(params) {
			// var params = {objId, funId, start, end, tick};
			return payutcAPI.genericApiCall(
				'STATS',
				'getNbSell',
				{ obj_id: params.objId, fun_id: params.funId, start: params.start, end: params.end || payutcAPI.config.date.toISOString() },
				params.callback
			);
		},

		getRevenue(params) {
			// var params = {funId, start, end, appId};

			// exception pour appID
			// appId , start, end, tick are optional
			if (typeof appId !== 'undefined') {
				return payutcAPI.genericApiCall(
					'STATS',
					'getRevenue',
					{ fun_id: params.funId, app_id: params.appId, start: params.start || '1999-01-01T00:00', end: params.end || '2060-01-01T00:00' },
					params.callback
				);
			} else {
				return payutcAPI.genericApiCall(
					'STATS',
					'getRevenue',
					{ fun_id: params.funId, start: params.start || '1999-01-01T00:00', end: params.end || '2060-01-01T00:00' },
					params.callback
				);
			}
		},

		getSales(params) {
			// var params = {funId, start, end, rowCount}
			return payutcAPI.genericApiCall(
				'GESSALES',
				'getSales',
				{ fun_id: params.funId, start: params.start, end: params.end, row_count: params.rowCount },
				params.callback
			);
		},

		getSalesByProduct(params) {
			// var params =  {funId, objId, start, end}
			module.exports.stats.getSales({
				funId: params.funId,
				start: params.start,
				end: params.end,
				callback(salesData) {
					salesData = JSON.parse(salesData);

					const result = [];

					for (let i = 0; i < salesData.count; i++) {
						const transSize = salesData.transactions[i].rows.length;

						for (let j = 0; j < transSize; j++) {
							if (salesData.transactions[i].rows[j].item.id === params.objId && salesData.transactions[i].rows[j].removed === false) {
								result.push(salesData.transactions[i].rows[j]);
							}
						}
					}

					if (params.callback) params.callback(result);
					return result;
				}
			});
		}
	},

	rights: {
		setUserRight(params) {
			// var params= {usrId, service, funId}
			return payutcAPI.genericApiCall(
				'USERRIGHT',
				'setUserRight',
				{ usr_id: params.usrId, service: params.service, fun_id: params.funId },
				params.callback
			);
		},

		setApplicationRight(params) {
			// var params = {appId, service, funId}
			return payutcAPI.genericApiCall(
				'APPLICATIONRIGHT',
				'setApplicationRight',
				{ app_id: params.appId, service: params.service, fun_id: params.funId },
				params.callback
			);
		},

		removeUserRight(params) {
			// var params = {usrId, service, funId}
			return payutcAPI.genericApiCall(
				'USERRIGHT',
				'removeUserRight',
				{ usr_id: params.usrId, service: params.service, fun_id: params.funId },
				params.callback
			);
		},

		removeApplicationRight(params) {
			// var params = {appId, service, funId}
			return payutcAPI.genericApiCall(
				'APPLICATIONRIGHT',
				'removeApplicationRight',
				{ app_id: params.appId, service: params.service, fun_id: params.funId },
				params.callback
			);
		},

		block(params) {
			// var params = {usrId, dateFin, funId, reason}
			return payutcAPI.genericApiCall(
				'BLOCKED',
				'block',
				{ fun_id: params.funId, usr_id: params.usrId, date_fin: params.dateFin, raison: params.reason },
				params.callback
			);
		},

		removeBlock(params) {
			// var params = {bloId, funId}
			return payutcAPI.genericApiCall('BLOCKED', 'remove', { blo_id: params.bloId, fun_id: params.funId }, params.callback);
		}
	},

	selfpos: {
		getBuyerInfo(params) {
			// var params = {login}
			return payutcAPI.genericApiCall('SELFPOS', 'getBuyerInfo', { login: params.login }, params.callback);
		},

		getArticles(params) {
			// var params = {funId}
			return module.exports.articles.getArticles(params, true);
		},

		getCategories(params) {
			// var params = {funIdsArray}
			return module.exports.articles.getCategories(params, true);
		},

		cancel(params) {
			// var params = {funId, purId}
			return payutcAPI.genericApiCall('SELFPOS', 'cancel', { fun_id: params.funId, pur_id: params.purId }, params.callback);
		},

		transaction(params) {
			// var params = {funId, buyer, objIds}
			return payutcAPI.genericApiCall(
				'SELFPOS',
				'transaction',
				{ fun_id: params.funId, buyer: params.buyer, obj_ids: params.objIds },
				params.callback
			);
		}
	},

	keys: {
		registerApplication(params) {
			// var params = {appUrl, appName, [appDesc]}
			return payutcAPI.genericApiCall(
				'KEY',
				'registerApplication',
				{ app_url: params.appUrl, app_name: params.appName, app_desc: params.appDesc || null },
				params.callback
			);
		},

		getCurrentUserApplications(params) {
			return payutcAPI.genericApiCall('KEY', 'getCurrentUserApplications', {}, params.callback);
		}
	},

	users: {
		transfer(params) {
			// var params = {amount, usr_id, message};

			// needs CAS auth to retrieve user account
			// use loginCAS before using transfer, useless in client mode?
			return payutcAPI.genericApiCall(
				'TRANSFER',
				'transfer',
				{ amount: params.amount, userID: params.usr_id, message: params.message },
				params.callback
			);
		}
	},

	articles: {
		setPrice(params) {
			return payutcAPI.genericApiResourcesCall('GET', 'products', params.objId, null, product => {
				const priceId = JSON.parse(product).events_config[1].price;

				payutcAPI.genericApiResourcesCall('GET', 'prices', priceId, null, priceData => {
					priceData = JSON.parse(priceData);
					priceData.rows[0].value = params.price;
					payutcAPI.genericApiResourcesCall('PUT', 'prices', priceId, priceData, params.callback);
				});
			});
		},
		getArticles(params, selfpos) {
			// var params = {funId}
			if (selfpos) {
				return payutcAPI.genericApiCall('SELFPOS', 'getArticles', { fun_id: params.funId }, params.callback);
			} else {
				return payutcAPI.genericApiCall('POSS3', 'getArticles', { fun_id: params.funId }, params.callback);
			}
		},

		getProducts(params) {
			// var params = {funIdsArray};

			return payutcAPI.genericApiCall('GESARTICLE', 'getProducts', { fun_ids: params.funIdsArray }, params.callback);
		},

		getCategories(params, selfpos) {
			// var params = {funIdsArray};
			if (selfpos) {
				return payutcAPI.genericApiCall('SELFPOS', 'getCategories', { fun_id: params.funIdsArray[0] }, params.callback);
			} else {
				return payutcAPI.genericApiCall('GESARTICLE', 'getCategories', { fun_ids: params.funIdsArray }, params.callback);
			}
		},

		getCategory(params) {
			// var params = {catId, funId};

			return payutcAPI.genericApiCall('GESARTICLE', 'getCategory', { fun_id: params.funId, obj_id: params.catId }, params.callback);
		},

		setCategory(params) {
			// var params = {name, funId, objId, parentId};

			// objId and parentId are optional
			return payutcAPI.genericApiCall(
				'GESARTICLE',
				'setCategory',
				{ name: params.name, parent_id: params.parentId || 'null', fun_id: params.funId, obj_id: params.objId || 'null' },
				params.callback
			);
		},

		deleteCategory(params) {
			// var params = {catId, funId};

			// on est obliges d'eliminer les articles en cascade
			// pour cela on recup tous les articles de la fun
			// vu que getProductsByCategory nexiste plus
			// et on compare le category_id de l'article avec catId
			// a eliminer, si ce sont les memes, le produit est elimine
			if (payutcAPI.config.async !== false) {
				payutcAPI.config.async = false;
			}
			const change = payutcAPI.config.async;
			// /we make async false so that every product is deleted one by one before the category
			let prod = this.getProducts([payutcAPI.config.fun_id]);

			prod = JSON.parse(prod);
			for (let i = 0; i < prod.length; i++) {
				if (Number(prod[i].categorie_id) === params.catId) {
					this.deleteProduct(prod[i].id, payutcAPI.config.fun_id);
				}
			}

			if (change) {
				payutcAPI.config.async = change; // in theory = true
			}

			return payutcAPI.genericApiCall('GESARTICLE', 'deleteCategory', { obj_id: params.catId, fun_id: params.funId }, params.callback);
		},

		getProduct(params) {
			// var params = {objId, funId};

			return payutcAPI.genericApiCall('GESARTICLE', 'getProduct', { obj_id: params.objId, fun_id: params.funId || 'null' }, params.callback);
		},

		getProductsByCategory(params, selfpos) {
			// var params = {funId};
			selfpos = selfpos || 0;

			// funIds as array
			const prods = [],
				cats = [];
			const parent = this;

			this.getArticles(
				{
					funId: params.funId,
					callback(dataProds) {
						const prod = JSON.parse(dataProds);

						parent.getCategories(
							{
								funIdsArray: [params.funId],
								callback(dataCateg) {
									const categ = JSON.parse(dataCateg);

									const resp = [];

									for (let i = 0; i < categ.length; i++) {
										resp[i] = {
											name: categ[i].name,
											id: categ[i].id,
											products: []
										};
									}

									for (let i = 0; i < prod.length; i++) {
										for (let j = 0; j < resp.length; j++) {
											if (prod[i].categorie_id === resp[j].id) {
												resp[j].products.push(prod[i]);
											}
										}
									}

									params.callback(resp);
									return resp;
								}
							},
							selfpos
						);
					}
				},
				selfpos
			);
		},

		setProduct(params) {
			// var params = {name, category, price, stock, alcool, image, image_path, funId, objId, tva, cotisant, meta, parent};

			// objId, tva and cotisant are optional
			// objId is only if remaking an article
			// prix en euros
			if (params.alcool === true) params.alcool = 0;
			if (params.alcool === false) params.alcool = 1;
			return payutcAPI.genericApiCall(
				'GESARTICLE',
				'setProduct',
				{
					name: params.name,
					parent: params.category,
					prix: params.price,
					stock: params.stock,
					alcool: params.alcool,
					image: params.image,
					image_path: params.image_path,
					fun_id: params.funId,
					obj_id: params.objId || null,
					tva: params.tva || '0.00',
					cotisant: params.cotisant || '1',
					meta: params.meta
				},
				params.callback
			);
		},

		deleteProduct(params) {
			// var params = {objId, funId};

			return payutcAPI.genericApiCall('GESARTICLE', 'deleteProduct', { obj_id: params.objId, fun_id: params.funId }, params.callback);
		}
	},

	reload: {
		info(params) {
			return payutcAPI.genericApiCall('RELOAD', 'info', null, params.callback);
		},

		reload(params) {
			// var params = amount, callbackUrl
			return payutcAPI.genericApiCall('RELOAD', 'reload', { amount: params.amount, callbackUrl: params.callbackUrl }, params.callback);
		}
	},

	websale: {
		createTransaction(params) {
			// var params = {itemsArray[[item1, qtty1],[item2, qtty2]...], funId, mail, returnUrl, callbackUrl}
			// return url = returns user on finish
			// callbackUrl = url to send {tra_id} on finish -- call getTransactionInfo after that to check on status
			return payutcAPI.genericApiCall(
				'WEBSALE',
				'createTransaction',
				{ items: params.itemsArray, fun_id: params.funId, mail: params.mail, return_url: params.returnUrl, callback_url: params.callbackUrl },
				params.callback
			);
		},

		getTransactionInfo(params) {
			// var params = funId, traId
			return payutcAPI.genericApiCall('WEBSALE', 'getTransactionInfo', { fun_id: params.funId, tra_id: params.traId }, params.callback);
		}
	}
};
