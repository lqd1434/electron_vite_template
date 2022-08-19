import jsonfile from 'jsonfile';
import { exec } from 'child_process';


/**
 *
 * @param server {import('vite').ViteDevServer}
 * @returns {string}
 */
export const getDevPath = (server)=>{
	const protocol = `http${server.config.server.https ? 's' : ''}:`;
	const host = server.config.server.host || 'localhost';
	const port = server.config.server.port;
	const path = '/';
	return `${protocol}//${host}:${port}${path}`;
}

/**
 *
 * @param {string} path
 * @returns {Promise<Object>}
 */
export const readJson = async (path) => {
	return new Promise((resolve, reject) => {
		jsonfile.readFile(path, function (err, obj) {
			if (err) reject(err);
			resolve(obj);
		});
	});
};
/**
 *
 * @param {string} path
 * @param {Object} obj
 * @returns {Promise<boolean>}
 */
export const writeJson = async (path, obj) => {
	try {
		await jsonfile.writeFile(path, obj);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};
/**
 *
 * @param {string} path
 * @returns {Promise<Object>}
 */
export const formatJson = (path) => {
	try {
		exec(`prettier --write ${path}`);
	} catch (e) {
		console.error(e);
	}
};

