import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, Text, View, StyleSheet, Button, TextInput, Alert } from 'react-native';

export default function Posts({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState(null);

  const JsonPlaceholder_API = 'https://jsonplaceholder.typicode.com/posts';

  useEffect(() => {
    fetchPosts();
  }, []);

  // Carrega os posts da API
  const fetchPosts = async () => {
    try {
      const response = await fetch(JsonPlaceholder_API);
      if (!response.ok) throw new Error('Erro ao carregar postagens.');
      const data = await response.json();
      setPosts(data); // Carrega os posts no estado
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      Alert.alert('Erro', 'Não foi possível carregar as postagens.');
    }
  };

  // Adiciona uma nova postagem
  const addPost = () => {
    if (title && body) {
      const newPost = {
        id: posts.length > 0 ? posts[posts.length - 1].id + 1 : 1, // Gera um ID único localmente
        title,
        body,
        userId: 1,
      };

      // Simula persistência adicionando ao estado local
      setPosts([newPost, ...posts]);
      clearForm();
      Alert.alert('Sucesso', 'Postagem adicionada com sucesso.');
    } else {
      Alert.alert('Erro', 'Preencha todos os campos antes de adicionar uma postagem.');
    }
  };

  // Atualiza uma postagem existente
  const updatePost = () => {
    if (title && body && editingId) {
      const updatedPosts = posts.map(post =>
        post.id === editingId ? { ...post, title, body } : post
      );

      // Atualiza o estado local
      setPosts(updatedPosts);
      clearForm();
      Alert.alert('Sucesso', 'Postagem atualizada com sucesso.');
    } else {
      Alert.alert('Erro', 'Preencha todos os campos antes de atualizar a postagem.');
    }
  };

  // Deleta uma postagem
  const deletePost = id => {
    const filteredPosts = posts.filter(post => post.id !== id);

    // Atualiza o estado local
    setPosts(filteredPosts);
    Alert.alert('Sucesso', 'Postagem deletada com sucesso.');
  };

  // Preenche o formulário para edição
  const editPost = post => {
    setTitle(post.title);
    setBody(post.body);
    setEditingId(post.id);
  };

  const clearForm = () => {
    setTitle('');
    setBody('');
    setEditingId(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.body}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Editar" onPress={() => editPost(item)} />
        <Button title="Comentários" onPress={() => navigation.navigate('Comments', { postId: item.id })} />
        <Button title="Excluir" onPress={() => deletePost(item.id)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Postagem"
        value={body}
        onChangeText={setBody}
      />
      <Button
        title={editingId ? "Atualizar Postagem" : "Adicionar Postagem"}
        onPress={editingId ? updatePost : addPost}
      />
      <FlatList
        data={posts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 16,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
