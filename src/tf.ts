import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface Process {
	mainModule: any;
	env: any;
	argv: any[];
	exit: Function;
	cwd: Function;
}
declare var process: Process;

const HOME = process.env.HOME || '~';
const argv = process.argv.splice(2);

const DIR = p => path.join(process.mainModule.path, p);
let TF_DIR_PATH = path.join(HOME, '.tf');

if ( !fs.existsSync(TF_DIR_PATH) ) {
	TF_DIR_PATH = DIR('tf');
}

interface GlobalOptions {
	author: string;
	email: string;
	license: string;
}

const findTFConfig = (dir: string) => {
	if ( dir === '/' ) return;

	const dirs = fs.readdirSync(dir);
	for ( const item of dirs ) {
		if ( item === '.tfrc' ) {
			return path.join(dir, item);
		}
	}

	return findTFConfig(path.dirname(dir));
}

const g_options: GlobalOptions = {
	'author'      : '',
	'email'       : '',
	'license'     : 'MIT',
};

const errorMsg = (msg: any) => {
	console.error(msg);
};

const printErrorExit = (msg: any) => {
	errorMsg(msg+"\n");
	errorMsg("Usage: tf [options...] [file]");
	errorMsg("       file:   target file path");
	errorMsg("");
	errorMsg("Options");
	errorMsg("  --author               Who are author? [default: (from git config)]");
	errorMsg("  --email                What is author's email? [default: (from git config)]");
	errorMsg("  --license              File license [default: MIT]");
	process.exit();
};

if ( argv.length < 1 ) {
	printErrorExit('Invalid Options');
}

const tfConfigPath = findTFConfig(process.cwd());

if ( tfConfigPath ) {
	const optStr = fs.readFileSync(tfConfigPath, { encoding: 'utf8' });
	const opt = JSON.parse(optStr);
	if ( opt.author ) g_options.author = opt.author;
	if ( opt.email ) g_options.email = opt.email;
	if ( opt.license ) g_options.license = opt.license;
}

if ( !g_options.email ) {
	g_options.email = execSync('git config --global user.email', { encoding: 'utf8' }).trim() || '';
}

if ( !g_options.author ) {
	g_options.author = execSync('git config --global user.name', { encoding: 'utf8' }).trim() || '';
}


const files: string[] = [];

const parsingArgv = (argv: string[]) => {
	let i = 0, len = argv.length;
	for (i=0;i < len;i++) {
		if ( argv[i][0] === "-" ) {
			if ( argv[i][1] && argv[i][1] === "-" ) {
				// --[option]

				if ( argv[i].match(/--user=/) ) {
					g_options['user'] = argv[i].replace(/--user=/, "");
				} else if ( argv[i].match(/--extension=/) ) {
					g_options['extension'] = argv[i].replace(/--extension=/, "");
				} else if ( argv[i].match(/--email=/) ) {
					g_options['email'] = argv[i].replace(/--email=/, "");
				} else if ( argv[i].match(/--license=/) ) {
					g_options['license'] = argv[i].replace(/--license=/, "");
				} else {
					switch ( argv[i] ) {
						default: printErrorExit('Invalid Options');
					}
				}

			} else {
				// -[options]
				let len = argv[i].length;
				for (let idx = 1;idx < len;idx++) {
					switch ( argv[i][idx] ) {
						default: printErrorExit('Invalid Options');
					}
				}
			}
		} else {
			files.push(argv[i]);
		}
	}
};

parsingArgv(argv);

if ( files.length <= 0 ) {
	printErrorExit('Invalid Arguments.');
}

for ( const file of files ) {
	const target = path.join(process.cwd(), file);
	const ext = path.extname(target);
	let source = path.join(TF_DIR_PATH, 'tf' + ext);

	if ( !fs.existsSync(source) ){
		source = path.join(DIR('../tf'), 'tf' + ext);
		if ( !fs.existsSync(source) ) {
			source = path.join(TF_DIR_PATH, 'tf.default');
			if ( !fs.existsSync(source) ) {
				source = path.join(DIR('../tf'), 'tf.default');
				console.log(source);

				if ( !fs.existsSync(source) ) {
					// touch
					fs.writeFileSync(target, '', { encoding: 'utf8' });
					continue;
				}
			}
		}
	}

	const sourceContent = fs.readFileSync(source, { encoding: 'utf8' });
	const targetContent = sourceContent.
							replace(/{{file}}/gi, path.basename(target)).
							replace(/{{path}}/gi, path.dirname(target)).
							replace(/{{date}}/gi, new Date().toDateString()).
							replace(/{{author}}/gi, g_options.author).
							replace(/{{email}}/gi, g_options.email).
							replace(/{{license}}/gi, g_options.license);

	fs.writeFileSync(target, targetContent, {encoding: 'utf8'});
}
