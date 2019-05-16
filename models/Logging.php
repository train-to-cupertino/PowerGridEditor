<?php
namespace app\models;

use Yii;
use yii\base\NotSupportedException;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use app\components\IpBehavior;

class Logging extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%logging}}';
    }

    /**
     * @inheritdoc
     */
	
    public function behaviors()
    {
        return [
			[
            'class' => TimestampBehavior::className(),
			'createdAtAttribute' => 'time',
			'updatedAtAttribute' => 'time',
			],
			
            'ip' => [
                'class' => IpBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['ip_addr', 'ip_addr'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => 'ip_addr',
                ],
            ]
        ];
    }
	
	
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            //['status', 'default', 'value' => self::STATUS_ACTIVE],
            //['status', 'in', 'range' => [self::STATUS_ACTIVE, self::STATUS_DELETED]],
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
        return Yii::$app->get('db_logging');
    }	
	
	
	public static function add($action, $param = '', $value = '') {
		$model = new Logging();
		
		$model->user_id = Yii::$app->user->id;
		$model->action = $action;
		$model->param = $param;
		$model->value = $value;
		
		return $model->save() ? $model->id : 0;
	}
}