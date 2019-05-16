<?php
namespace app\components;

use Yii;

/**
 * Extended yii\web\User
 *
 * This allows us to do "Yii::$app->user->something" by adding getters
 * like "public function getSomething()"
 *
 * So we can use variables and functions directly in `Yii::$app->user`
 */
class PgUser extends \yii\web\User
{
	/*
    public function getUsername() {
        return \Yii::$app->user->identity->username;
    }
	*/
    public function getLogin() {
        return \Yii::$app->user->identity->login;
    }	
	
    public function getName() {
        return \Yii::$app->user->identity->name;
    }
	
    public function getStatus() {
        return \Yii::$app->user->identity->status;
    }	
	
	public function getHasAccessToSchemas() {
		return \Yii::$app->user->identity->expiration_at >= time();
	}
}