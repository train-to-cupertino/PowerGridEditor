function NamingPolicyManager()
{

}

NamingPolicyManager.getUniqueNodeName = function()
{
	var res = "";

	res += new Date().getTime();
	
	res += "_" + Math.random();
	
	return md5(res);
}