<?php
//namespace common\models;
namespace app\models;

use Yii;
use yii\base\NotSupportedException;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;

class Pgschema extends ActiveRecord /*implements IdentityInterface*/
{
	// Максимальное количество бэкапов схемы
	//const MAX_BACKUP_COUNT = 5;
	const MAX_BACKUP_COUNT = 20;


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
	

	// Сделать бэкап в Sqlite базу
	public function backup() {
		if ($this->is_folder)
			return false;
	
		$backup = new Pgschema_backup();
		
		$backup->user_id = $this->user_id;
		$backup->name = $this->name;
		$backup->json_code = $this->json_code;
		$backup->schema_id = $this->id;
		$backup->time = time();
		
		$res = true;
		
		try {
			if ($backup->save()) {
				$res = true;
				
				// 
				$query = 'DELETE FROM `pgschema` WHERE schema_id = :sid AND id NOT IN ( 
					SELECT id FROM (
						SELECT id FROM `pgschema` WHERE schema_id = :sid ORDER BY id DESC LIMIT '.self::MAX_BACKUP_COUNT.') foo)';
					
				Yii::$app->db_backup->createCommand($query)->bindValue(':sid', $this->id)->execute();
			}
		}
		catch(Exception $e)
		{
			$res = false;	
		}

		return $res;
	}
	
	public function restore($pgschema_backup_id) {
		
	}
}
