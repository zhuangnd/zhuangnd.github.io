---
markdown手册
---
# markdown guide
##overview
[TOC]
##块元素
###标题
`#`的数量表示标题的级别
```markdown
# 标题1
## 标题2
### 标题3
#### 标题4
##### 标题5
###### 标题6
```

---
###列表
####有序列表
```markdown
1. item1
2. item2
3. item3
```

1. item1

2. item2

3. item3

####无序列表
```markdown
* item1
* item2
* item3
```
* item1

* item2

* item3

####任务清单
```markdown
- [ ] tasklist1
- [ ] tasklist2
- [x] tasklist3
```

- [ ] tasklist1

- [ ] tasklist2

- [x] tasklist3

---
###引用  
```markdown
尼采：
> 上帝已死
```
尼采：
> 上帝已死

---
### 脚注

可以添加脚注[^1] 

---
###代码模块  
```markdown
​```
#未指定语言
for number in range(1,11)
	print(number)
​```
```
```
#未指定语言
for number in range(1,11)
	print(number)
```
```markdown
​```python
#指定语言，语法高亮
for number in range(1,11)
	print(number)
​```
```
```python
#指定语言，语法高亮
for number in range(1,11)
	print(number)
```

---
###image
###图片  
####markdown
```markdown
![usa](https://zhuangnd.github.io/gallery/usa/DSC01362.jpg)
```
![usa](https://zhuangnd.github.io/gallery/usa/DSC01362.jpg)
####html
```html
width
<img src="https://zhuangnd.github.io/gallery/usa/DSC01622.jpg" width="400px" />
style zoom
<img src="https://zhuangnd.github.io/gallery/usa/DSC01850.jpg" style="zoom:50%;" />
div align center
<div align=center>
	<p><strong>居中对齐</strong></p>
	<image src="https://zhuangnd.github.io/gallery/usa/DSC01623.jpg" width=50% />
</div>
```
#####width px
<img src="https://zhuangnd.github.io/gallery/usa/DSC01622.jpg" width="400px" />
#####style zoom
<img src="https://zhuangnd.github.io/gallery/usa/DSC01850.jpg" style="zoom:50%;" />
#####div align center  
```html
<div align=center>
	<p><strong>居中对齐</strong></p>
	<image src="https://zhuangnd.github.io/gallery/usa/DSC01623.jpg" width=50% />
</div>  
```

---
###数学公式
####单行公式
``` markdown
$y=(a \times x  +  b)^{2}$
```
$y=(a \times x  +  b)^{2}$  


####复杂公式模块
You can render *LaTeX* mathematical expressions using **MathJax**.

In markdown source file, math block is *LaTeX* expression wrapped by ‘$$’ mark:

``` markdown
$$
\mathbf{V}_1 \times \mathbf{V}_2 =  \begin{vmatrix} 
\mathbf{i} & \mathbf{j} & \mathbf{k} \\
\frac{\partial X}{\partial u} &  \frac{\partial Y}{\partial u} & 0 \\
\frac{\partial X}{\partial v} &  \frac{\partial Y}{\partial v} & 0 \\
\end{vmatrix}
$$
```

Input `$$`, then press 'Return' key will trigger an input field which accept *Tex/LaTex* source. Following is an example:
$$
\mathbf{V}_1 \times \mathbf{V}_2 =  \begin{vmatrix} 
\mathbf{i} & \mathbf{j} & \mathbf{k} \\
\frac{\partial X}{\partial u} &  \frac{\partial Y}{\partial u} & 0 \\
\frac{\partial X}{\partial v} &  \frac{\partial Y}{\partial v} & 0 \\
\end{vmatrix}
$$

---

###表格
```markdown
| id   | name | phone |
| --- | --- | --- |
| 1    | li   | 8888888 |
| 2    | zs   | 6666666 |
| 3    | ds   | 5555555 |
```
| id   | name | phone   |
| ---- | ---- | ------- |
| 1    | li   | 8888888 |
| 2    | zs   | 6666666 |
| 3    | ds   | 5555555 |

---
##行元素
###链接  
####方括号[]链接
```markdown
点击[zhuangnd's homepage](https://zhuangnd.github.io/ "zhaungnd的主页")，打开zhuangnd的主页
点击[zhuangnd's gallery](https://zhuangnd.github.io/gallery/breathe/)，进入网上画廊
```
点击[zhuangnd's homepage](https://zhuangnd.github.io/ "zhaungnd的主页")，打开zhuangnd的主页
点击[zhuangnd's gallery](https://zhuangnd.github.io/gallery/breathe/)，进入网上画廊
####尖括号<>URLs地址
```markdown
发送email <zhuangnd@me.com> 
```
发送email <zhuangnd@me.com> 
####内部链接  
==一级标题#==的内部链接，只支持==英文==标题，空格用==-==代替，按Ctrl(Command) + Click 点击跳转
```markdown
点击[markdown指南](#markdown-guide)将转到`markdown guide`
点击[怎么插入图片](#image)将转到`image`
```
点击[markdown指南](#markdown-guide)将转到`markdown guide`
点击[怎么插入图片](#image)将转到`image`

#### Reference Links 
适合多次使用的链接，提高效率
Reference-style links use a second set of square brackets, inside which you place a label of your choosing to identify the link:

``` markdown
This is [zhuangnd的主页][hp] reference-style link.
Then, anywhere in the document, you define your link label like this, on a line by itself:
这句可以放在任何位置：
[hp]: https://zhuangnd.github.io/  "zhuangnd的主页"
```

In typora, they will be rendered like:
This is [zhuangnd的主页][hp] reference-style link.

The implicit link name shortcut allows you to omit the name of the link, in which case the link text itself is used as the name. Just use an empty set of square brackets — e.g., to link the word “Google” to the google.com web site, you could simply write:

``` markdown
[Google][]
And then define the link:
[Google]: http://google.com/
```
[Google][]

In typora click link will expand it for editing, command+click will open the hyperlink in web browser.

---
###高亮
```markdown
对需要强调的==文本高亮==显示
```
对需要强调的==文本高亮==显示 

---
###标注
```markdown
`色块标注`
```
`行内引用色块标注`  

---
###下标
Subscript
```markdown
用两个 ~ 框住下标内容,空格用 "\ ", for example: H~2~O, X~long\ text~
```
Then use ~ to wrap subscript content, for example: H~2~O, X~long\ text~
###上标
Superscript
```markdown
用两个 ^ 框住上标内容,空格用 "\ ", for example: X^2^, X^long\ text^
```
Then use ^ to wrap superscript content, for example: X^2^, X^long\ text^

---
###斜体
```markdown
*斜体*，_斜体_
```
*斜体*，_斜体_

---
###加粗
```markdown
**粗体**，__粗体__
```
**粗体**，__粗体__

---
###删除线
```markdown
~~删除~~
```
~~删除~~

---
###下划线
```html
<u>Underline</u> becomes Underline.
```
<u>Underline</u> becomes Underline.

---

[^1]: 脚注1
[hp]: https://zhuangnd.github.io/  "zhuangnd的主页"
[Google]: http://google.com/