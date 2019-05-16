<?php
use yii\helpers\Html;

$this->title = 'Профиль пользователя';
?>
<div class="site-error">

    <h3>Профиль пользователя</h3>

	<div class="panel panel-default">
		<div class="panel-heading"><b>Параметры</b></div>
		<table class="table table-bordered table-condensed table-hover">
			<?php foreach($params as $param_field => $param_name): ?>
			<tr>
				<td><?php echo $param_name; ?></td>
				<td><?php echo $user->{$param_field}; ?></td>
			</tr>
			<?php endforeach; ?>
			<tr>
				<td>Дата регистрации</td>
				<td><?php echo date('d-m-Y', $user->created_at); ?></td>
			</tr>
			<tr>
				<td>Срок действия аккаунта</td>
				<td>До <?php echo date('H:i d-m-Y', $user->expiration_at); ?> (Осталось: <?php echo $user->humanTimeExpire; ?>)</td>
			</tr>			
		</table>		
	</div>

</div>
