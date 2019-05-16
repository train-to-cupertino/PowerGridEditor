<?php
//namespace common\models;
namespace app\models;

use Yii;
use yii\base\NotSupportedException;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;

/**
 * User model
 *
 * @property integer $id
 * @property string $login
 * @property string $password_hash
 * @property string $password_reset_token
 * @property string $email
 * @property string $auth_key
 * @property integer $status
 * @property integer $created_at
 * @property integer $updated_at
 * @property string $password write-only password
 */
class User extends ActiveRecord implements IdentityInterface
{
    const STATUS_DELETED = 0;
    const STATUS_ACTIVE = 10;
	const STATUS_ADMIN = 1000;


    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%user}}';
    }

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            TimestampBehavior::className(),
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['status', 'default', 'value' => self::STATUS_ACTIVE],
            ['status', 'in', 'range' => [self::STATUS_ACTIVE, self::STATUS_DELETED, self::STATUS_ADMIN]],
        ];
    }

    /**
     * @inheritdoc
     */
    public static function findIdentity($id)
    {
		return static::findOne(['id' => $id]);
    }

    /**
     * @inheritdoc
     */
    public static function findIdentityByAccessToken($token, $type = null)
    {
        throw new NotSupportedException('"findIdentityByAccessToken" is not implemented.');
    }

    /**
     * Ищет пользователя по логину
     *
     * @param string $login
     * @return static|null
     */
    public static function findByLogin($login)
    {
		return static::findOne(['login' => $login]);
    }

    /**
     * Ищет пользователя по токену восстановления
     *
     * @param string $token password reset token
     * @return static|null
     */
    public static function findByPasswordResetToken($token)
    {
        if (!static::isPasswordResetTokenValid($token)) {
            return null;
        }

        return static::findOne([
            'password_reset_token' => $token,
        ]);
    }

    /**
     * Finds out if password reset token is valid
     *
     * @param string $token password reset token
     * @return bool
     */
    public static function isPasswordResetTokenValid($token)
    {
        if (empty($token)) {
            return false;
        }

        $timestamp = (int) substr($token, strrpos($token, '_') + 1);
        $expire = Yii::$app->params['user.passwordResetTokenExpire'];
        return $timestamp + $expire >= time();
    }

    /**
     * @inheritdoc
     */
    public function getId()
    {
        return $this->getPrimaryKey();
    }

    /**
     * @inheritdoc
     */
    public function getAuthKey()
    {
        return $this->auth_key;
    }

    /**
     * @inheritdoc
     */
    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

    /**
     * Validates password
     *
     * @param string $password password to validate
     * @return bool if password provided is valid for current user
     */
    public function validatePassword($password)
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    /**
     * Generates password hash from password and sets it to the model
     *
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }

    /**
     * Generates "remember me" authentication key
     */
    public function generateAuthKey()
    {
        $this->auth_key = Yii::$app->security->generateRandomString();
    }

    /**
     * Generates new password reset token
     */
    public function generatePasswordResetToken()
    {
        $this->password_reset_token = Yii::$app->security->generateRandomString() . '_' . time();
    }

    /**
     * Removes password reset token
     */
    public function removePasswordResetToken()
    {
        $this->password_reset_token = null;
    }
	
	
    /**
     * Is user has access to schemas
     */
    public function getHasAccessToSchemas()
    {
        return $this->expiration_at >= time();
    }	
	
	
	//public function humanTimeExpire($time)
	public function getHumanTimeExpire()
	{
		$time = $this->expiration_at - time(); // to get the time since that moment
		
		if ($time <= 0)
			return 'Срок действия окончен';
		
		$tokens = array (
			31536000 => function($count) { if ($count >= 5 && $count <= 20) return 'лет'; if ($count % 10 == 1) return 'год'; if ($count % 10 >= 2 && $count % 10 <= 4) return 'года'; return 'лет';},
			2592000 => function($count) { return 'мес.'; },
			604800 => function($count) { return 'нед.'; },
			86400 => function($count) { return 'дн.'; },
			3600 => function($count) { return 'ч.'; },
			60 => function($count) { return 'мин.'; },
			1 => function($count) { return 'сек.'; }
		);		
		$result = '';
		$counter = 1;
		foreach ($tokens as $unit => $text) {
			if ($time < $unit) 
				continue;

			$numberOfUnits = floor($time / $unit);
			$result .= "$numberOfUnits ".$text($numberOfUnits)." ";
			$time -= $numberOfUnits * $unit;
			++$counter;
		}

		if (!trim($result))
			return $time." сек.";
		return "{$result}";
	}
	
	
	public static function add($login, $pass) {
		$user = new User;
		$user->login = $login;
		$user->setPassword($pass);
		
		$s = $user->save();
		return $s;
	}
	
	
	
}
