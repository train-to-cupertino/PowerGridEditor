<?php
namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use app\models\Pgschema;
use app\models\Logging;
use yii\web\View;
use yii\data\ActiveDataProvider;


class SchemaController extends Controller
{
	const NEW_SCHEMA_JSON_CODE = '{ "name": "Новая схема", "nodes": [], "lines": [], "loads": [], "source": null }';

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
                        'actions' => ['new', 'newfolder', 'list', 'edit', 'save', 'delete', 'updatepreview', 'visio'],
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
	
	
	/**
		Отображение списка схем пользователя
	*/
	public function actionList()
	{
		$this->view->title = "Список схем";
	
		$this->view->registerJs(
			'$(".delete_schema").click(function(){
				var schema_id = $(this).data("schemaid");
				
				if (confirm("Вы действительно хотите удалить схему №" + schema_id))
					if (prompt("Введите для подтверждения номер схемы:") == schema_id)
						$.get(
							"/schema/delete",
							{
								schema_id: schema_id
							},
						  
							function onAjaxSuccess(data)
							{
								// Здесь мы получаем данные, отправленные сервером и выводим их на экран.
								//alert(data);
								
								window.location.replace("/schema/list");
							}		  
						);
					else
						alert("Введенный номер схемы не совпадает с номером схемы, \nкоторую вы собирались удалить!");
				
				
			});',
			View::POS_END,
			'powergrid_initialize'
		);	
				
		$this->view->registerCssFile("/css/powergrid.css");		
		
		/*
			Ищем все схемы и папки пользователя
			Удаленные схемы и папки не отображаются
		*/
		$dataProvider = new ActiveDataProvider([
			'query' => Pgschema::find()
				->where('user_id = '.Yii::$app->user->id.' AND is_deleted = 0 AND folder_id = :fid')
				->params([':fid' => Yii::$app->request->get('folder_id') ? Yii::$app->request->get('folder_id') : 0]),
			
			'pagination' => [
				'pageSize' => 10,
			],
			
			'sort' => [
				'defaultOrder' => [
					'is_folder' => SORT_DESC,
					'updated_at' => SORT_DESC,
				]
			],
		]);
		
		return $this->render('list_dp', [
			'dataProvider' => $dataProvider
		]);
	}
	
	
	// Графический редактор
	public function actionEdit() {
		$this->view->title = "Редактирование схемы";
	
		$schema = $this->findSchema($_GET['id']);
		
		$this->view->registerJs(
			'var current_schema_id = '.$schema->id.';
			var current_schema_code = '.$schema->json_code.';',
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
		//$this->view->registerJsFile('/js/pg/raphael.free_transform.js', ['position' => \yii\web\View::POS_HEAD]);
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

		$this->view->registerJsFile('/js/pg/CPGExportHelper.js', ['position' => \yii\web\View::POS_END]);
		$this->view->registerJsFile('/js/pg/PGApp.js', ['position' => \yii\web\View::POS_END]);
		$this->view->registerJsFile('/js/pg/editor.js', ['position' => \yii\web\View::POS_END]);
		
		Logging::add('edit_schema', 'schema_id', $schema->id);
		
		return $this->render('edit', [
			'schema' => $schema
		]);
	}
	
	
	// Обновить превью
	public function actionUpdatepreview()
	{
		if (!isset($_POST['id']))
			return json_encode(['result' => 'fail', 'error' => 'Отсутствует ID схемы']);
			
		$schema = $this->findSchema($_POST['id']);
			
		if (!$schema)
			return json_encode(['result' => 'fail', 'error' => 'Отсутствует схема с ID = '.$_POST['id']]);
		
		if (!isset($_POST['svg']))
			return json_encode(['result' => 'fail', 'error' => 'Отсутствуют SVG данные']);
			
		$svg = $_POST['svg'];
		
		if (!$svg)
			return json_encode(['result' => 'fail', 'error' => 'SVG данные не содержат информации']);

		// Генерация превьюшки
		$png_path = Yii::$app->converter::convertSvgToPng($svg, 128, 128);
		
		// Если не сгенерировалась, то выдаем ошибку
		if (!$png_path)
			return json_encode(['result' => 'fail', 'error' => 'Не удалось создать PNG файл']);
		
		$old_preview = $schema->img_preview;
		
		$schema->img_preview = $png_path;
		if (!$schema->save())
			return json_encode(['result' => 'fail', 'error' => 'Не удалось обновить превью схемы']);
			
		@unlink(\Yii::getAlias('@webroot').$old_preview);
		@rmdir(\Yii::getAlias('@webroot')."/schemas_img/".substr(basename($old_preview), 0, 3));
		return json_encode(['result' => 'success', 'error' => '']);
	}
	
	
	// Сохранение схемы через ajax
	public function actionSave()
	{
		$json_code = $_POST['json_code'];
		$schema_id = $_POST['schema_id'];
		
		$schema = Pgschema::find()->where('id = :id AND user_id = '.Yii::$app->user->id, [':id' => $schema_id])->one();
		
		if ($schema !== null) {
			$schema->json_code = $json_code;
			
			// Наименование схемы
			$schema_code = json_decode($schema->json_code, true);
			
			if (isset($schema_code['name']) && $schema_code['name'])
				$schema->name = $schema_code['name'];
			else
				$schema->name = "";
			
			$result = $schema->save();
			try {
				$backup_res = $schema->backup();
				
				// Логирование бэкапа схемы
				if ($backup_res)
					Logging::add('successful_backup_schema', 'schema_id', $schema->id);
				else
					Logging::add('unsuccessful_backup_schema', 'schema_id', $schema->id);
					
				// Логирование сохранения схема
				if ($result)
					Logging::add('successful_saving_schema', 'schema_id', $schema->id);
				else
					Logging::add('unsuccessful_saving_schema', 'schema_id', $schema->id);
				
					
			} catch(Exception $e) {
				Logging::add('unsuccessful_backup_schema', 'schema_id', $schema->id);
			}
			
			$result_json = [
				'result' => $result,
				'errors' => $result ? '' : $schema->getErrors()
			];
		}
		else
		{
			$result_json = [
				'result' => false,
				'errors' => ['Ошибка! Схема с ID '.$schema_id.' не найдена']
			];
		}
		
		echo json_encode($result_json);
	}
	
	
	// Новая схема
	public function actionNew()
	{
		$schema = new Pgschema();
		
		$schema->json_code = self::NEW_SCHEMA_JSON_CODE;
		$schema->user_id = Yii::$app->user->id;
		$schema->name = "Новая схема";
		
		$result = $schema->save();
		
		if ($result) {
			// Логирование успешного создания схемы
			Logging::add('successful_creating_schema', 'schema_id', $schema->id);
			$this->redirect(array('schema/edit', 'id' => $schema->id));
		} else {
			// Логирование неуспешного создания схемы
			Logging::add('unsuccessful_creating_schema', 'schema_id', $schema->id);
			$this->redirect(array('schema/list'));
		}
	}
	
	
	
	// Удаление через ajax
	public function actionDelete()
	{
		$schema_id = $_GET['schema_id'];
		
		$schema = Pgschema::find()->where('id = :id AND user_id = '.Yii::$app->user->id, [':id' => $schema_id])->one();
		if ($schema !== null) {
			// Флаг удаления
			$schema->is_deleted = "1";
			// Сохраняем
			$result = $schema->save();			

			// Логирование установки флага "Удаленная" для схемы
			if ($result) {
				Logging::add('succesful_mark_schema_deleted', 'schema_id', $schema->id);
			} else {
				Logging::add('unsuccesful_mark_schema_deleted', 'schema_id', $schema->id);
			}

			$result_json = [
				'result' => true,
				'errors' => ''
			];
        } else {
			$result_json = [
				'result' => false,
				'errors' => ['Ошибка! Схема с ID '.$schema_id.' не была удалена']
			];            
		}
		
		echo json_encode($result_json);
	}
	
	
	public function actionNewfolder() {
		$folder_id = Yii::$app->request->get('folder_id') ? Yii::$app->request->get('folder_id') : 0;
		
		$schema = new Pgschema();
		
		$schema->user_id = Yii::$app->user->id;
		$schema->name = "Новая папка";
		$schema->is_folder = 1;
		$schema->folder_id = $folder_id;
		
		$result = $schema->save();
		
		if ($result) {
			Logging::add('succesful_creating_folder', 'schema_id', $schema->id);
			$this->redirect(array('schema/list', 'folder_id' => $schema->id));
		} else {
			Logging::add('unsuccesful_creating_folder', 'schema_id', $schema->id);
			$this->redirect(array('schema/list'));
		}
	}
	

	public function actionVisio() {
		$svg_data = Yii::$app->request->post('svg_data');
		
		$result = Yii::$app->pgexport::toVisioFromSvg($svg_data);
	}
	
	
	public function beforeAction($action)
    {
		// Экшены, на которые накладывается ограничение
		$deniedActions = ['actionNew', 'actionNewfolder', 'actionEdit', 'actionDelete', 'actionSave', /*'actionUpdatepreview'*/];
		
		if (in_array($action->actionMethod, $deniedActions))	
			if(\Yii::$app->user->isGuest || !\Yii::$app->user->hasAccessToSchemas)
				return \Yii::$app->getResponse()->redirect('/site/profile')->send();
		
		return true;
    }		
	
	
	protected function findSchema($id) {
		$schema = Pgschema::find()->where('id = :id AND user_id = '.Yii::$app->user->id.' AND is_deleted = 0 AND is_folder = 0', [':id' => $id])->limit(1)->one();
		if ($schema !== null) {
            return $schema;
        } else {
			throw new NotFoundHttpException('Запрашиваемая страница не найдена!');
        }
    }
	
	
}
