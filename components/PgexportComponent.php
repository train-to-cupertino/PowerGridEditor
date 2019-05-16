<?php
namespace app\components;

use Yii;
use yii\base\Component;
use yii\base\InvalidConfigException;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

use PhpOffice\PHPVisio;

 
class PgexportComponent extends Component {
	
	// Экспорт результатов расчета схемы в Excel
	public static function toExcel($calc_data) {
		// ---
		// Вывод ошибки, в случае, если исходные данные некорректны
		// ---
		try {
			$calc_data = json_decode($calc_data, 1);
			if (!$calc_data)
				throw new \Exception('В исходных данных содержится ошибка!');
		} catch (\Exception $e) {
			// Документ Excel
			$spreadsheet = new Spreadsheet();
		
			// Удаляем все листы		
			$sheetCount = $spreadsheet->getSheetCount();
			for ($i = $sheetCount - 1; $i >= 0; $i--) {
				$spreadsheet->removeSheetByIndex($i);
			}
			
			// Создаем основной лист
			$sheetMain = $spreadsheet->createSheet();
			$sheetMain->setTitle('Ошибка (Error)');
			$spreadsheet->setActiveSheetIndex(0);

			// Ссылка на активный лист
			$sheetMain = $spreadsheet->getActiveSheet();
			
			// Задать содержимое ячейки по её координатам [столбец - строка]
			$sheetMain->setCellValueByColumnAndRow(1, 1, 'Возникла ошибка при сохранении результатов расчета!');
			$sheetMain->setCellValueByColumnAndRow(1, 2, 'An error occurred while saving the calculation results!');
			

			/*
				Запись данных в стандартный вывод
			*/			
			// Создать writer
			$writer = new Xlsx($spreadsheet);

			// Заголовки
			header('Content-disposition: attachment; filename=export_error.xlsx');
			header('Content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			//header('Content-Length: ' . filesize($file));
			header('Content-Transfer-Encoding: binary');
			header('Cache-Control: must-revalidate');
			header('Pragma: public');		
			
			// Сохранить документ при помощи writer'a в стандартный вывод
			$writer->save("php://output");

			// Уничтожение переменных
			$spreadsheet = null;
			$writer = null;
			
			return;
		}
		
		// /////////
		// Массив соответствия номеров фаз и их наименований
		$phase = Yii::$app->calc::getPhase();
		
		// Стиль ячейки с тонкими границами
		$thinBorderedCellStyle = [
			'borders' => [
				'allBorders' => [
					'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
					'color' => ['argb' => '00000000'],
				],
			],
		];
		
		// Стиль ячейки с толстыми границами
		$thickBorderedCellStyle = [
			'borders' => [
				'outline' => [
					'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK,
					'color' => ['argb' => '00000000'],
				],
			],
		];		
		// \\\\\\\\\ 
	
		// ---
		// Запись результатов расчета
		// ---
		// Документ Excel
		$spreadsheet = new Spreadsheet();

		// Удаляем все листы
		$sheetCount = $spreadsheet->getSheetCount();

		for ($i = $sheetCount - 1; $i >= 0; $i--) {
			$spreadsheet->removeSheetByIndex($i);
		}
		
		// Лист №1 "Общие данные"
		// Создаем лист и задаем его наименование
		$sheetMain = $spreadsheet->createSheet();
		$sheetMain->setTitle('Общие данные');
		$spreadsheet->setActiveSheetIndex(0);
		
		// Ссылка на активный лист
		$sheetMain = $spreadsheet->getActiveSheet();		
	
		// Запись данных на лист "Общие данные"
		if ($calc_data && $calc_data['calc_data'] && $calc_data['calc_data']['powergrid'] && is_array($calc_data['calc_data']['powergrid'])) {
			// Общие данные
			$data = $calc_data['calc_data']['powergrid'];
			
			// Вывод параметров схемы и их значений
			$row = 1;
			foreach($data as $param_name => $param_val) {
				// Перевод названий параметров на текущий язык приложения
				$param_name = Yii::$app->calc::getParamProp($param_name, 'translate')[Yii::$app->language] ?? $param_name;
				
				// Наименование параметра
				$sheetMain->setCellValueByColumnAndRow(1, $row, $param_name);
				// Значение параметра
				$sheetMain->setCellValueByColumnAndRow(2, $row, $param_val);
					
				$row++;
			}
			
			// - - -
			// Оформление
			// - - -
			// Установка автоматической ширины столбцов
			$sheetMain->getColumnDimensionByColumn(1)->setAutoSize(true);
			$sheetMain->getColumnDimensionByColumn(2)->setAutoSize(true);
			// Жирный шрифт для названия параметров
			$sheetMain->getStyleByColumnAndRow(1, 1, 1, 65535)->getFont()->setBold(true); // From [1, 1] to [1, count(data)] (col, row)
			// Тонкие межячеечные границы по всей области данных
			$sheetMain->getStyleByColumnAndRow(1, 1, 2, count($data))->applyFromArray($thinBorderedCellStyle);			
			// Толстые границы по контуру всей области данных
			$sheetMain->getStyleByColumnAndRow(1, 1, 2, count($data))->applyFromArray($thickBorderedCellStyle);
			
		} else {
			$sheetMain->setCellValueByColumnAndRow(1, 1, 'Ошибка! Не удалось вывести общие данные схемы!');
		}
		// КОНЕЦ Лист №1


		// Лист №2 "Линии"
		// Создаем лист и задаем его наименование
		$sheetLines = $spreadsheet->createSheet();
		$sheetLines->setTitle('Расчет линий');
		$spreadsheet->setActiveSheetIndex(1);
		
		// Ссылка на активный лист
		$sheetLines = $spreadsheet->getActiveSheet();
		
		// Запись данных на лист "Линии"
		if ($calc_data && $calc_data['calc_data'] && $calc_data['calc_data']['lines'] && is_array($calc_data['calc_data']['lines'])) {
			// Общие данные
			$data = $calc_data['calc_data']['lines'];
			
			// Вывод данных расчета линий
			$current_line = 0;
			foreach($data as $line_id => $line_data) {
				if ($data[$line_id] && is_array($data[$line_id]) && ($line_id != 'line_source')) {
					$row = $current_line * 5 + 1;
					$sheetLines->setCellValueByColumnAndRow(1, $row, $line_id);
					$sheetLines->setCellValueByColumnAndRow(2, $row, 'Напряжение, В');
					$sheetLines->setCellValueByColumnAndRow(3, $row, 'Ток, А');
					$sheetLines->setCellValueByColumnAndRow(4, $row, 'Потери, кВт');
				
					for($i = 0; $i <= 3; $i++) {
						if (true) {
							$row = $current_line * 5 + $i + 2;
							$sheetLines->setCellValueByColumnAndRow(1, $row, 'Фаза '.mb_strtoupper($phase[$i], 'UTF-8'));
							$sheetLines->setCellValueByColumnAndRow(2, $row, $line_data[$i]['voltage']);
							$sheetLines->setCellValueByColumnAndRow(3, $row, $line_data[$i]['amperage']);
							$sheetLines->setCellValueByColumnAndRow(4, $row, $line_data[$i]['loses']);
						}
					}
					
					// Тонкие межячеечные границы по всей области данных
					$sheetLines->getStyleByColumnAndRow(1, $current_line * 5 + 1, 4, $current_line * 5 + 5)->applyFromArray($thinBorderedCellStyle);
					// Толстые границы по контуру всей области данных
					$sheetLines->getStyleByColumnAndRow(1, $current_line * 5 + 1, 4, $current_line * 5 + 5)->applyFromArray($thickBorderedCellStyle);					
					// Жирный шрифт для заголовков
					$sheetLines->getStyleByColumnAndRow(1, $current_line * 5 + 1, 4, $current_line * 5 + 1)->getFont()->setBold(true);

					$current_line++;
				}
			}

			// Оформление
			// Установка автоматической ширины столбцов
			$sheetLines->getColumnDimensionByColumn(1)->setAutoSize(true);
			$sheetLines->getColumnDimensionByColumn(2)->setAutoSize(true);			
			$sheetLines->getColumnDimensionByColumn(3)->setAutoSize(true);
			$sheetLines->getColumnDimensionByColumn(4)->setAutoSize(true);			
		} else {
			$sheetLines->setCellValueByColumnAndRow(1, 1, 'Ошибка! Не удалось вывести данные расчета линий!');
		}
		// КОНЕЦ Лист №2
		
		// Лист №3 "Нагрузки"
		// Создаем лист и задаем его наименование
		$sheetLoads = $spreadsheet->createSheet();
		$sheetLoads->setTitle('Расчет нагрузок');
		$spreadsheet->setActiveSheetIndex(2);
		
		// Ссылка на активный лист
		$sheetLoads = $spreadsheet->getActiveSheet();
		
		// Запись данных на лист "Нагрузки"
		if ($calc_data && $calc_data['calc_data'] && $calc_data['calc_data']['loads'] && is_array($calc_data['calc_data']['loads'])) {
			// Общие данные
			$data = $calc_data['calc_data']['loads'];

			$sheetLoads->setCellValueByColumnAndRow(1, 1, 'Нагрузка');
			$sheetLoads->setCellValueByColumnAndRow(2, 1, 'Напряжение, В');
			$sheetLoads->setCellValueByColumnAndRow(3, 1, 'Ток, А');
			
			// Вывод данных расчета нагрузок
			$current_load = 1;
			foreach($data as $load_id => $load_data) {
				if ($data[$load_id] && is_array($data[$load_id])) {
					$row = $current_load + 1;

					$sheetLoads->setCellValueByColumnAndRow(1, $row, $load_id);
					$sheetLoads->setCellValueByColumnAndRow(2, $row, $load_data['voltage']);
					$sheetLoads->setCellValueByColumnAndRow(3, $row, $load_data['amperage']);
					
					$current_load++;
				}
			}
			
			// - - - 
			// Оформление
			// - - - 
			// Установка автоматической ширины столбцов
			$sheetLoads->getColumnDimensionByColumn(1)->setAutoSize(true);
			$sheetLoads->getColumnDimensionByColumn(2)->setAutoSize(true);			
			$sheetLoads->getColumnDimensionByColumn(3)->setAutoSize(true);
			// Тонкие межячеечные границы по всей области данных
			$sheetLoads->getStyleByColumnAndRow(1, 1, 3, count($data) + 1)->applyFromArray($thinBorderedCellStyle);
			// Толстые границы по контуру всей области данных
			$sheetLoads->getStyleByColumnAndRow(1, 1, 3, count($data) + 1)->applyFromArray($thickBorderedCellStyle);			
			// Жирный шрифт для заголовков
			$sheetLoads->getStyleByColumnAndRow(1, 1, 3, 1)->getFont()->setBold(true);			
		} else {
			$sheetLoads->setCellValueByColumnAndRow(1, 1, 'Ошибка! Не удалось вывести данные расчета нагрузок!');
		}
		// КОНЕЦ Лист №3		
		
		/*
			Запись данных в стандартный вывод
		*/
		// Создать writer
		$writer = new Xlsx($spreadsheet);
		
		// Заголовки
		header('Content-disposition: attachment; filename=Результаты_расчета.xlsx');
		header('Content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		//header('Content-Length: ' . filesize($file));
		header('Content-Transfer-Encoding: binary');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');		
		
		// Сохранить документ при помощи writer'a в файл
		//$writer->save('hello world.xlsx');		
		// Сохранить документ при помощи writer'a в стандартный вывод
		$writer->save("php://output");
	}
	
	
	// Экспорт схемы в Visio
	public static function toVisioFromSvg($svg_data) {
		// Временный файл
		$tmpfile = new \tmpfile;
		// Запись SVG данных во временный файл
		if (!$svg_data)
			$svg_data = file_get_contents('C:\xampp\htdocs\web\mySvg.svg');
			
		$tmpfile->write($svg_data); // РАССКОММЕНТИРОВАТЬ
		// Полный путь к файлу
		$tmp_filename = $tmpfile; $tmp_filename = (string)$tmp_filename;
		// Имя svg файла
		$tmp_filename_svg = dirname($tmp_filename) . DIRECTORY_SEPARATOR . basename($tmp_filename, '.tmp') . '_' . '.svg'; // РАССКОММЕНТИРОВАТЬ
		//$tmp_filename_svg = 'C:\xampp\htdocs\web\mySvg.svg'; // ЗАКОММЕНТИРОВАТЬ
		// Меняем имя файла c xxxxxx.tmp на xxxxxx_.svg
		rename($tmp_filename, $tmp_filename_svg);
		
		//echo $tmp_filename_svg;

		// Запускаем visio
		$application = new \COM("visio.application");
		
		// Открываем SVG файл
		$document = $application->Documents->Open($tmp_filename_svg);
		
		// Имя VSD файла
		$tmp_filename_vsd = Yii::getAlias('@webroot').'/tmp_data/tmp_vsd' . DIRECTORY_SEPARATOR . basename($tmp_filename_svg, '.svg') . '.vsd';
		// Сохраняем VSD файл
		$document->SaveAs($tmp_filename_vsd);
		
		// Удаляем SVG файл
		@unlink($tmp_filename_svg);
		
		echo basename($tmp_filename_vsd);
		
		$document->Close();
		$application->Quit();
	}
	
	
	public static function toVisioExample() {
		// Временный файл
		$tmpfile = new \tmpfile;
		// Полный путь к файлу
		$tmp_filename = $tmpfile; $tmp_filename = (string)$tmp_filename;
		$rand = mt_rand(1, 999);
		
		$application = new \COM("visio.application");

        // Не отображать окно приложения
        $application->Application->Visible = 0;
	
		// Добавление документа
		$doc = $application->Documents->Add("");
		
		// Коллекция документов ???
		$visioDocs = $application->Documents;

		// Открытие коллекции 
		$visioStencil = $visioDocs->OpenEx("Basic Shapes.vss", 4);
		
		$visioPage = $application->ActivePage;

		$visioRectMaster = $visioStencil->Masters->ItemU("Rectangle");
		$visioRectShape = $visioPage->Drop($visioRectMaster, 4.25, 5.5);
		$visioRectShape->Text = "Rectangle text ".$rand;
		
		$application->ActiveDocument->SaveAs($tmp_filename);
		
		header("Content-Type: application/vnd.visio");
		header("Content-Disposition: attachment;Filename=Schema.vsd");		
		
		echo $tmpfile->read();
		
		$application->Quit();
		$application = Null;
	}
}