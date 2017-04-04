<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%@page import="java.io.*"%>
<%
String path="./count.txt";
writeNumber(String.valueOf(readNumber(path)+1),path);
%>
<%=readNumber(path) %>
<%!
  /**
   * 写入数字内容
   *
   * @param number
   * @param filename
   * @return
   */
  public boolean writeNumber(String number, String filename) {
    try {
      FileOutputStream fos = new FileOutputStream(filename);
      OutputStreamWriter writer = new OutputStreamWriter(fos);
      writer.write(number);
      writer.close();
      fos.close();
    } catch (IOException e) {
      e.printStackTrace();
      return false;
    }
    return true;
  }
  /**
   * 读取数字内容
   * 
   * @param filename
   * @return
   */
  public int readNumber(String filename) {
    int number = 0;
    try {
      File file = new File(filename);
      if (file.exists()) {
        FileReader fr = new FileReader(file);
        BufferedReader br = new BufferedReader(fr);
        String contents = br.readLine();
        if (contents != null && contents.length() > 0) {
          contents = contents.replaceAll("[^0-9]", "");
          number = Integer.valueOf(contents);
        }
        br.close();
        fr.close();
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    return number;
  }
%>
