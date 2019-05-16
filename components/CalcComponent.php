<?php
namespace app\components;

 
use Yii;
use yii\base\Component;
use yii\base\InvalidConfigException;
 
class CalcComponent extends Component
{
	/*
	 * Значения параметров расчета по-умолчанию
	 */
	
	// Напряжение источника, фаза A, Вольт
	const DEFAULT_PHASE_A_VOLTAGE = 240;
	//Напряжение источника, фаза B, Вольт
	const DEFAULT_PHASE_B_VOLTAGE = 240;
	// Напряжение источника, фаза C, Вольт
	const DEFAULT_PHASE_C_VOLTAGE = 240;
	
	// Общее изменение нагрузки, о.е.
	const DEFAULT_TOTAL_LOAD_CHANGE = 1;
	// Общее изменение коэф. заполнения, о.е.
	const DEFAULT_TOTAL_KZAP_CHANGE = 0;
	// Количество дней для расчета
	const DEFAULT_TOTAL_DAYS = 30;
	
	/* -------------------------------------- */
	
	//"C:\Users\Map\Documents\Visual Studio 2012\Projects\PG04Console\PG04Console\bin\Debug\PG04Console.exe" "C:\Users\Map\Desktop\Конвертация\zapad_test_invalid_data.pgl"
	//const CALC_PROGRAM_FULL_PATH = "C:\Users\Map\Documents\Visual Studio 2012\Projects\PG04Console\PG04Console\bin\Debug\PG04Console.exe";
	const CALC_PROGRAM_FULL_PATH = "C:\inetpub\wwwroot\software\PG04Console.exe";
	
	
	
	public static function getPhase()
	{	
		return [
			0 => 'a',
			1 => 'b',
			2 => 'c',
			3 => 'n'
		];
	}
	
	
	public static function getParamProp($param_name, $prop_name)
	{
		$params = self::params();
		
		if (isset($params[$param_name]) && isset($params[$param_name][$prop_name]))
			return $params[$param_name][$prop_name];
			
		return null;
	}
	
	
	public static function params()
	{
		return [
			'averageSourceVoltage' => [
				'translate' => [
					'ru-RU' => 'Среднее напряжение источника'
				],
			],
			'loadsCount' => [
				'translate' => [
					'ru-RU' => 'Количество нагрузок'
				],
			],
			'fiderConsumption' => [
				'translate' => [
					'ru-RU' => 'Потребление фидера, кВтч'
				],
			],
			'loadsConsumption' => [
				'translate' => [
					'ru-RU' => 'Потребление нагрузок, кВтч'
				],
			],
			'sourceAmperageA' => [
				'translate' => [
					'ru-RU' => 'Ток фазы A трансформатора, А'
				],
			],
			'sourceAmperageB' => [
				'translate' => [
					'ru-RU' => 'Ток фазы B трансформатора, А'
				],
			],
			'sourceAmperageC' => [
				'translate' => [
					'ru-RU' => 'Ток фазы C трансформатора, А'
				],
			],
			'sourceAmperageN' => [
				'translate' => [
					'ru-RU' => 'Ток нейтрали трансформатора, А'
				],
			],
			'maximumLinesVoltage' => [
				'translate' => [
					'ru-RU' => 'Максимальное напряжение сети'
				],
			],
			'mimimumLinesVoltage' => [
				'translate' => [
					'ru-RU' => 'Минимальное напряжение сети'
				],
			],
			'minimumVoltageNodeIndex' => [
				'translate' => [
					'ru-RU' => 'Опора с минимальным напряжением'
				],
			],
			'totalLoadChange' => [
				'translate' => [
					'ru-RU' => 'Общее изменение нагрузки'
				],
			],
			'totalKzapChange' => [
				'translate' => [
					'ru-RU' => 'Общее изменение коэф. заполнения'
				],
			],
			'csf' => [
				'translate' => [
					'ru-RU' => 'Общий cos(fi) нагрузки'
				],
			],
			'losesSum' => [
				'translate' => [
					'ru-RU' => 'Потери энергии в магистрали'
				],
			],
			'losesA' => [
				'translate' => [
					'ru-RU' => 'Потери энергии в магистрали (фаза A)'
				],
			],
			'losesB' => [
				'translate' => [
					'ru-RU' => 'Потери энергии в магистрали (фаза B)'
				],
			],
			'losesC' => [
				'translate' => [
					'ru-RU' => 'Потери энергии в магистрали (фаза C)'
				],
			],
			'losesN' => [
				'translate' => [
					'ru-RU' => 'Потери энергии в магистрали (нейтраль)'
				],
			],
			'losesDescents' => [
				'translate' => [
					'ru-RU' => 'Потери энергии в спусках'
				],
			],
			'losesTotal' => [
				'translate' => [
					'ru-RU' => 'Полные потери энергии'
				],
			],
			'losesTotalPercentage' => [
				'translate' => [
					'ru-RU' => 'Полные потери энергии в %'
				],
			],
		];
	}
}