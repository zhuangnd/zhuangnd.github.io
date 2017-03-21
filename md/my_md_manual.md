---
my markdown manual
---
[TOC]

```markdown
# 标题1
## 标题2
### 标题3
#### 标题4
##### 标题5
###### 标题6
```
---

# 标题
# 标题1


## 标题2

### 标题3

#### 标题4

##### 标题5

###### 标题6
---
# 列表
#### 有序列表

```markdown
1. item1
2. item2
3. item3
```

1. item1

2. item2

3. item3

#### 无序列表
```markdown
* item1
* item2
* item3
```
* item1

* item2

* item3

#### 任务清单
```markdown
- [ ] tasklist1
- [ ] tasklist2
- [x] tasklist3
```

- [ ] tasklist1

- [ ] tasklist2

- [x] tasklist3

---

# 引用
```markdown
尼采：
> 上帝已死
```
尼采：
> 上帝已死
---
# 代码模块
```
​```
#未指定语言
for number in range(1,11)
	print(number)
​```
​```python
#指定语言，语法高亮
for number in range(1,11)
	print(number)
​```
```

```
#未指定语言
for number in range(1,11)
	print(number)
```
```python
#指定语言，语法高亮
for number in range(1,11)
	print(number)
```
---
# in line 引用  

`引用`

---

# link and image  

[gallery “breathe”](https://zhuangnd.github.io/gallery/breathe)

![image](G:\pic\葛饰北斋 富岳三十六景\IMG_3905.jpg)

<img src="G:\pic\葛饰北斋 富岳三十六景\IMG_3881.jpg" width="400px" />

<img src="G:\pic\葛饰北斋 富岳三十六景\IMG_3901.jpg" style="zoom:50%;" />

---

# highlight  

```markdown
==highlight==
```
==高亮==

---

# table  

| id   | name |
| ---- | ---- |
| 1    | li   |
| 2    | zs   |
| 3    | ds   |
---
# another link  

<zhuangnd@me.com>

This is [an example][https://zhuangnd.github.io/gallery/usa] reference-style link.

Then, anywhere in the document, you define your link label like this, on a line by itself:

open [this][https://zhuangnd.github.io/gallery/stone]

[id]: https://zhuangnd.github.io/gallery/lsimaging "Optional Title Here"

This is [an example](https://zhuangnd.github.io/md/readme.html) inline link.

[This link](https://zhuangnd.github.io/d3/fjzone.html) has no title attribute.

---
# footnote  

可以添加脚注[^1]   
Flavored :香料  
binary :二进制  
parenthesis :插入语  
embedded :嵌入式  
lousy :糟糕  
modulus :系数  
octothorpe :井号  
beard :胡子  
assuming :假设  
twinkle :眨眼  
mischievous :恶作剧  
belittling :轻视  
condescending :居高临下  
insulting :侮辱  
weird :奇怪的  
prodigy :神童  
Persistence :坚持  
wean :断奶  
stuck :卡住  
slightly :略  
odd :奇  
arpeggios :琶音  
[^1]: 脚注1