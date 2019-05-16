<?php
namespace app\components;

use Yii;
use yii\base\Component;
use yii\base\InvalidConfigException;
 
class ConverterComponent extends Component
{
	/**
	 *	Конвертирует схему в формат PGL для последующего расчета программой PowerGrid04
	 */
	public static function convertSchemaToPGL($schema, $params)
	{
		if (!isset($params['voltage_a']) || !is_numeric($params['voltage_a']))
			$params['voltage_a'] = Yii::$app->calc::DEFAULT_PHASE_A_VOLTAGE;
			
		if (!isset($params['voltage_b']) || !is_numeric($params['voltage_b']))
			$params['voltage_b'] = Yii::$app->calc::DEFAULT_PHASE_B_VOLTAGE;
			
		if (!isset($params['voltage_c']) || !is_numeric($params['voltage_c']))
			$params['voltage_c'] = Yii::$app->calc::DEFAULT_PHASE_C_VOLTAGE;
			
		if (!isset($params['total_load_change']) || !is_numeric($params['total_load_change']))
			$params['total_load_change'] = Yii::$app->calc::DEFAULT_TOTAL_LOAD_CHANGE;

		if (!isset($params['total_kzap_change']) || !is_numeric($params['total_kzap_change']))
			$params['total_kzap_change'] = Yii::$app->calc::DEFAULT_TOTAL_KZAP_CHANGE;

		if (!isset($params['total_days']) || !is_numeric($params['total_days']))
			$params['total_days'] = Yii::$app->calc::DEFAULT_TOTAL_DAYS;			
			
			
		$schema_json_obj = json_decode($schema->json_code, true);
		
		
		$res = '<?xml version="1.0" encoding="utf-8"?>'.PHP_EOL;
		// Параметры сети
		$res .= '<PowerGrid '.
			'name="'.$schema->name.'" '.
			'voltageA="'.$params['voltage_a'].'" '.
			'voltageB="'.$params['voltage_b'].'" '.
			'voltageC="'.$params['voltage_c'].'" '.
			'totalLoadChange="'.$params['total_load_change'].'" '.
			'totalKzapChange="'.$params['total_kzap_change'].'" '.
			'totalDays="'.$params['total_days'].'">'.PHP_EOL;
		
			// Линии
			$res .= "\t".'<lines>'.PHP_EOL;
				if ($schema_json_obj['source'] && $schema_json_obj['source']['node'])
					$res .= "\t\t".'<PGLine '.
						//'name="line_source" '.
						'id="line_source" '.
						'startNode="0" '.
						'finishNode="'.$schema_json_obj['source']['node'].'" '.
						'length="0.001" '.
						'intersection="1000" '.
						'intersectionNeutral="1000" '.
						'inductiveResistance="0.1" />'.PHP_EOL;
			
				foreach($schema_json_obj['lines'] as $line)
				{
					$res .= "\t\t".'<PGLine '.
						//'name="'.$line["name"].'" '.
						'id="'.$line["id"].'" '.
						'startNode="'.$line['startNode'].'" '.
						'finishNode="'.$line['finishNode'].'" '.
						'length="'.$line['length'].'" '.
						'intersection="'.$line['intersection'].'" '.
						'intersectionNeutral="'.$line['intersectionNeutral'].'" '.
						'inductiveResistance="'.$line['inductiveResistance'].'" />'.PHP_EOL;
				}
			$res .= "\t".'</lines>'.PHP_EOL;
			
			// Нагрузки
			$res .= "\t".'<loads>'.PHP_EOL;
				foreach($schema_json_obj['loads'] as $load)
				{
					$phase = array_flip(Yii::$app->calc::getPhase())[$load['phase']];
					$res .= "\t\t" . '<PGLoad '.
						//'name="'.$load["name"].'" '.
						'id="'.$load["id"].'" '.
						'placement="'.$load['placement'].'" '.
					 	'node="'.$load['node'].'" '.
						'descentLength="'.$load['length'].'" '.
						'intersection="'.$load['intersection'].'" '.
						'power="'.$load['power'].'" '.
						'cosfi="'.$load['cosphi'].'" '.
						'Kzap="'.$load['kzap'].'" '.
						'phase="'.$phase.'" />'.PHP_EOL;
				}
			
			$res .= "\t".'</loads>'.PHP_EOL;			
		
		$res .= '</PowerGrid>';

		
		return $res;
	}
	
	
	public static function convertSvgToPng($svg, $x, $y){
		// Генерируем случайное имя файла
		$tmp_filename = md5(mt_rand());
		
		// Путь к временному файлу с SVG данными
		$svg_tmp_fullpath = \Yii::getAlias('@webroot')."/tmp_img/".$tmp_filename.".svg";
		// Путь к новому PNG файлу
		$png_tmp_fullpath = \Yii::getAlias('@webroot')."/schemas_img/".substr($tmp_filename, 0, 3)."/".$tmp_filename."_".$x."_".$y.".png";
		
		// Если нет подкаталога с 3мя первыми буквами имени файла
		if (!is_dir(\Yii::getAlias('@webroot')."/schemas_img/".substr($tmp_filename, 0, 3)))
			mkdir(\Yii::getAlias('@webroot')."/schemas_img/".substr($tmp_filename, 0, 3));
		
		// Пишем в SVG файл SVG данные
		file_put_contents($svg_tmp_fullpath, $svg);
		
		// Если папка для PNG файла существует и существует SVG файл
		if (
			is_dir(\Yii::getAlias('@webroot')."/schemas_img/".substr($tmp_filename, 0, 3)) && 
			file_exists($svg_tmp_fullpath)
		) {
			$command = '"C:\Program Files\ImageMagick-7.0.7-Q16\magick.exe" convert -background none -size '.$x.'x'.$y.' '.$svg_tmp_fullpath.' '.$png_tmp_fullpath;
			
			$res = shell_exec($command);
			
			// Если PNG файл был создан, то возвращаем путь к нему
			if (file_exists($png_tmp_fullpath))
			{
				@unlink($svg_tmp_fullpath);
				return "/schemas_img/".substr($tmp_filename, 0, 3)."/".$tmp_filename."_".$x."_".$y.".png";
			}
		}
			
		return "";
	}
}