<?php
namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use app\models\Pgschema;
use yii\web\NotFoundHttpException;
use app\models\Logging;
use yii\web\View;

class CalcController extends Controller
{
    /**
     * @inheritdoc
     */
	 
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [			
					// Для авторизованных пользователей
                    [
                        'actions' => ['do', 'config', 'exportexcel'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
					
					// Запрещены все действия
                    [
                        'allow' => false,
                    ],				

                ],
            ],
        ];
    }
	
	
	// Задание параметров расчета
	public function actionConfig($id)
	{
		// Получаем модель схемы
		$schema = $this->findSchema($id);	
		
		return $this->render('config', ['schema' => $schema]);
	}
	
	
	// Выполнение расчета при помощи консольного приложения
	public function actionDo($id)
	{	
		// Получаем модель схемы
		$schema = $this->findSchema($id);
		
		// Генерируем случайное имя файла
		$tmp_filename = md5(mt_rand());
		// Получаем полный путь, по которому сохраняем временный файл
		$tmp_fullpath = \Yii::getAlias('@webroot')."/tmp_schemas/".$tmp_filename.".pgj";

		// Конвертация схемы из JSON в формат *.pgl
		$res_pgl = Yii::$app->converter::convertSchemaToPGL($schema, $_GET); // XML-подобная схема приложения
		
		// Записываем в файл схему
		file_put_contents($tmp_fullpath, $res_pgl);
		
		// Формируем команду для консольного приложения
		$command = implode(" ", ['"'.Yii::$app->calc::CALC_PROGRAM_FULL_PATH.'"', '"'.$tmp_fullpath.'"']);
		
		// Выполняем программу расчета с временным файлом в качестве аргумента
		$result_json = shell_exec($command);
		
		// Меняем кодировку
		$res = iconv('CP866', 'UTF-8', $result_json);
		
		// Преобразуем выходные данные программы из JSON в массив
		$j_res = json_decode($res, true);
		
		// Если получился массив и известен код результата работы консольного приложения...
		if (is_array($j_res) && isset($j_res['result_code']))
		{
			switch($j_res['result_code'])
			{
				// Успешное окончание расчета
				case 100:
					// Удалить временный файл
					unlink($tmp_fullpath);

					// ****************************************
					// * Отображение схемы в графическом виде *
					// ****************************************

					$schema = $this->findSchema($id);
					
					$this->view->registerJs(
						'var current_schema_id = '.$schema->id.';
						var current_schema_code = '.$schema->json_code.';
						var calc_res = '.$res.';',
						View::POS_END,
						'current_schema_data'
					);
					
					// CSS
					$this->view->registerCssFile("/css/powergrid.css");		
					// Spectrum Color Picker CSS
					$this->view->registerCssFile("/js/spectrum/spectrum.css");		

					$this->view->registerJsFile('/js/misc/color_parse.js', ['position' => \yii\web\View::POS_HEAD]);		
					$this->view->registerJsFile('/js/underscore/underscore.min.js', ['position' => \yii\web\View::POS_END]);
					
					$this->view->registerJsFile('/js/misc/MD5.js', ['position' => \yii\web\View::POS_HEAD]);	
					$this->view->registerJsFile('/js/misc/GeometryHelper.js', ['position' => \yii\web\View::POS_HEAD]);	
					
					$this->view->registerJsFile('/js/pg/raphael.js', ['position' => \yii\web\View::POS_HEAD]);
					$this->view->registerJsFile('/js/pg/raphael.free_transform.js', ['position' => \yii\web\View::POS_HEAD]);
					$this->view->registerJsFile('/js/pg/raphael.polyline.js', ['position' => \yii\web\View::POS_HEAD]);
					$this->view->registerJsFile('/js/pg/raphael.export.js', ['position' => \yii\web\View::POS_HEAD]);
					$this->view->registerJsFile('/js/pg/raphael.group.js', ['position' => \yii\web\View::POS_HEAD]);
					$this->view->registerJsFile('/js/pg/raphael.drag.select.js', ['position' => \yii\web\View::POS_HEAD]);
					
					$this->view->registerJsFile('/js/spectrum/spectrum.js', ['position' => \yii\web\View::POS_END]);
					
					$this->view->registerJsFile('/js/pg/PGParamEditor.js', ['position' => \yii\web\View::POS_END]);
					$this->view->registerJsFile('/js/pg/PGAction.js', ['position' => \yii\web\View::POS_END]);
					$this->view->registerJsFile('/js/pg/PGActions.js', ['position' => \yii\web\View::POS_END]);
					$this->view->registerJsFile('/js/pg/CPGCalcResManager.js', ['position' => \yii\web\View::POS_END]);
					
					$this->view->registerJsFile('/js/pg/CPolylineVertex.js', ['position' => \yii\web\View::POS_END]);
					$this->view->registerJsFile('/js/pg/CPGElemGraphics.js', ['position' => \yii\web\View::POS_END]);					
					$this->view->registerJsFile('/js/pg/CPowerGrid.js', ['position' => \yii\web\View::POS_END]);
					$this->view->registerJsFile('/js/pg/CPGElement.js', ['position' => \yii\web\View::POS_END]);
						$this->view->registerJsFile('/js/pg/CPGNode.js', ['position' => \yii\web\View::POS_END]);
						$this->view->registerJsFile('/js/pg/CPGLine.js', ['position' => \yii\web\View::POS_END]);
						$this->view->registerJsFile('/js/pg/CPGLoad.js', ['position' => \yii\web\View::POS_END]);
						$this->view->registerJsFile('/js/pg/CPGSource.js', ['position' => \yii\web\View::POS_END]);		
					$this->view->registerJsFile('/js/pg/CFigure.js', ['position' => \yii\web\View::POS_END]);
					$this->view->registerJsFile('/js/pg/CGraphicElement.js', ['position' => \yii\web\View::POS_END]);
						$this->view->registerJsFile('/js/pg/CRectangle.js', ['position' => \yii\web\View::POS_END]);
						$this->view->registerJsFile('/js/pg/CEllipse.js', ['position' => \yii\web\View::POS_END]);
						$this->view->registerJsFile('/js/pg/CLabel.js', ['position' => \yii\web\View::POS_END]);
						$this->view->registerJsFile('/js/pg/CPolyline.js', ['position' => \yii\web\View::POS_END]);
					
					$this->view->registerJsFile('/js/pg/PGApp.js', ['position' => \yii\web\View::POS_END]);
					$this->view->registerJsFile('/js/pg/calc_viewer.js', ['position' => \yii\web\View::POS_END]);					
					
					// *******************************************
					
					Logging::add('successful_calculating_schema', 'schema_id', $schema->id);
					
					// Отображаем результаты расчета
					return $this->render('success', [
						'j_res' => $j_res, 
						'schema' => $schema, 
						'schema_json' => json_decode($schema->json_code, 1), 
						'result_json' => $res
					]);
				break;
				// ---
				

				default: 
					echo 'Undefined error!';
					Logging::add('unsuccessful_calculating_schema', 'schema_id', $schema->id);
				break;
				
			}		
		}
		
		echo 'Undefined error!';
		Logging::add('unsuccessful_calculating_schema', 'schema_id', $schema->id);
		return;
	}
	
	
	public function actionExportexcel() {
		$calc_data = Yii::$app->request->post('calc_data');
		Yii::$app->pgexport::toExcel($calc_data);
	}
	

	public function beforeAction($action)
    {
        if(\Yii::$app->user->isGuest || !\Yii::$app->user->hasAccessToSchemas) {
            return \Yii::$app->getResponse()->redirect('/site/profile')->send();
        }
		
		return true;
    }
	
	
	protected function findSchema($id)
    {
		$schema = Pgschema::find()->where('id = :id AND user_id = '.Yii::$app->user->id, [':id' => $id])->one();
		if ($schema !== null) {
            return $schema;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }	
}