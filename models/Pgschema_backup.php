<?php
//namespace common\models;
namespace app\models;

use Yii;
use yii\base\NotSupportedException;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;


class Pgschema_backup extends ActiveRecord /*implements IdentityInterface*/
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%pgschema}}';
    }
	
	
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['status', 'default', 'value' => self::STATUS_ACTIVE],
            ['status', 'in', 'range' => [self::STATUS_ACTIVE, self::STATUS_DELETED]],
        ];
    }


    /**
     * @inheritdoc
     */
    public function getId()
    {
        return $this->getPrimaryKey();
    }
	
	
    public static function getDb() {
        return Yii::$app->get('db_backup');
    }	
}
