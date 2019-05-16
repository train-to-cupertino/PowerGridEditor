<?php

/* @var $this \yii\web\View */
/* @var $content string */

use yii\helpers\Html;
use yii\bootstrap\Nav;
use yii\bootstrap\NavBar;
use yii\widgets\Breadcrumbs;
use app\assets\AppAsset;
use app\models\User;

AppAsset::register($this);
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>">
<head>
    <meta charset="<?= Yii::$app->charset ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?= Html::csrfMetaTags() ?>
    <title><?= Html::encode($this->title) ?></title>
    <?php $this->head() ?>
</head>
<body>

<?php $this->beginBody() ?>
<div class="wrap">
    <?php
    NavBar::begin([
		'brandLabel' => '<img src="/img/vector_logo_422x136.svg" class="navbar_logo"/>',
        'brandUrl' => Yii::$app->homeUrl,
        'options' => [
			'class' => 'navbar-vector navbar-fixed-top',
        ],
    ]);
    echo Nav::widget([
        'options' => ['class' => 'navbar-nav navbar-right'],
        'items' => [
			!Yii::$app->user->isGuest ? ['label' => '<b>Схемы</b>', 'url' => ['/schema/list']] : "",
			
            ['label' => 'Помощь', 'url' => ['/site/help']],
			
            Yii::$app->user->isGuest ? 
			(
                ['label' => 'Войти', 'url' => ['/site/login']]
            ) : 
			(
				'<li class="dropdown">
					<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">'.
						'Пользователь'.
					' <span class="caret"></span></a>
					<ul class="dropdown-menu">
						<li>'.Html::a("Профиль", ['/site/profile']).'</li>'.
						'<li role="separator" class="divider"></li>
						<li>'.
							Html::a("Выход", ['/site/logout'], ['data' => ['method' => 'post'],/*'class' => 'white text-center',*/]).
						'</li>
					</ul>
				</li>'
            )
        ],
		
		'encodeLabels' => false
    ]);
    NavBar::end();
    ?>
	
    <div class="container">
		<?php if(!Yii::$app->user->isGuest && !User::findIdentity(Yii::$app->user->id)->hasAccessToSchemas): ?>
			<div class="expiration_message">
				Данный аккаунт имеет ограничения в связи с истекшим периодом работоспособности. <a href="javascript:void(0);">Подробнее</a>
			</div>
		<?php endif; ?>
        <?= Breadcrumbs::widget([
            'links' => isset($this->params['breadcrumbs']) ? $this->params['breadcrumbs'] : [],
        ]) ?>
        <?= $content ?>
    </div>
</div>

<footer class="footer">
    <div class="container">
        <p class="pull-left">&copy; ООО "ЦУП-Вектор" <?= date('Y') ?></p>
    </div>
</footer>
<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
