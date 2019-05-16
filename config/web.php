<?php

$params = require(__DIR__ . '/params.php');

$config = [
    'id' => 'basic',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
	'language' => 'ru-RU', // язык приложения
    'components' => [

		'repaint' => [
				'class' => 'app\components\RepaintComponent',
		],
		
		'calc' => [
				'class' => 'app\components\CalcComponent',
		],		
		
		'pgexport' => [
				'class' => 'app\components\PgexportComponent'
		],
		
		'converter' => [
			   'class' => 'app\components\ConverterComponent',
		],				
	
        'request' => [
            // !!! insert a secret key in the following (if it is empty) - this is required by cookie validation
            'cookieValidationKey' => '***',
        ],
		
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
        'user' => [
			'class' => 'app\components\PgUser',
            'identityClass' => 'app\models\User',
            'enableAutoLogin' => true,
        ],
		
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
		
        'mailer' => [
            'class' => 'yii\swiftmailer\Mailer',
            // send all mails to a file by default. You have to set
            // 'useFileTransport' to false and configure a transport
            // for the mailer to send real emails.
            'useFileTransport' => true,
        ],
		
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
		
        'db' => require(__DIR__ . '/db.php'),
		
		'db_backup' => require(__DIR__. '/db_backup.php'),
		
		'db_logging' => require(__DIR__. '/db_logging.php'),
        
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
			//'showScriptName' => true,
			//'enableStrictParsing' => false,
            'rules' => [
				'<controller:\w+>/<id:\d+>' => '<controller>/view',
				'<controller:\w+>/<action:\w+>/' => '<controller>/<action>',
				'<controller:\w+>/<action:\w+>' => '<controller>/<action>',
				'<controller:\w+>/export/<action:\w+>' => '<controller>/export<action>',
				
				/*
				   '/' => 'site/index',
				   '<controller:\w+>/' => '<controller>/index',
				   '<controller:\w+>/<action:(\w|-)+>/<id:\d+>' => '<controller>/<action>',
				   '<module:\w+>/<controller:\w+>/<action:(\w|-)+>' => '<module>/<controller>/<action>',
				   '<controller:\w+>/<action:(\w|-)+>' => '<controller>/<action>'				
				*/
				
				
				/*
    '<controller:(site)>/<id:\d+>/<action:(create|update|delete)>' => '<controller>/<action>',
    '<controller:(post|comment)>/<id:\d+>' => '<controller>/view',
    '<controller:(post|comment)>s' => '<controller>/index',		
*/	

            ],
        ],
        
    ],
    'params' => $params,
];

if (YII_ENV_DEV) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
    ];
}

return $config;
