<%@ Page Language="C#" AutoEventWireup="true" CodeFile="act.aspx.cs" Inherits="AddNumber" %>
act.aspx.cs
代码
public partial class AddNumber : System.Web.UI.Page
{
private static int count = 1;
protected void Page_Load(object sender, EventArgs e)
{
count ;
Response.Write("var pv=document.getElementById(pv); pv.innerText=" count ";");
}
}